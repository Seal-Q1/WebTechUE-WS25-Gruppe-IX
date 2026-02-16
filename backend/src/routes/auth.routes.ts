import {type Request, type Response, Router} from 'express';
import pool from '../pool';
import cfg from '../../config.json';
import {AuthJwtPayload, parseTokenUserId, sendBadRequest, sendInternalError, sendNotFound} from '../utils';
import type {
    AuthResponseDto,
    AuthUserDto,
    CardType,
    ChangePasswordDto,
    LoginRequestDto,
    PaymentCardDto,
    RegisterRequestDto,
    UpdateProfileDto,
    UserAddressDto
} from '@shared/types';
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import {UserRow} from "../serializers";

const router = Router();

const ROLE_ID_RESTR_OWNER = 2;

interface UserRowWithPassword {
    user_id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password_hash: string;
    role_id: number;
    role_name: string;
    user_status_id: number;
    status_name: string;
    warning_count: number;
    address_id: number | null;
    address_street: string | null;
    address_house_nr: string | null;
    address_postal_code: string | null;
    address_city: string | null;
    address_door: string | null;
    password_reset_token: string | null;
    password_reset_expires: Date | null;
}

// Helper function to check if user is admin (by role or admin_list)
async function isUserAdmin(userId: number, roleId: number): Promise<boolean> {
    // Check if role is admin (role_id = 3)
    if (roleId === 3) return true;
    
    // Also check admin_list for backwards compatibility
    const result = await pool.query(
        'SELECT 1 FROM admin_list WHERE user_id = $1',
        [userId]
    );
    return result.rows.length > 0;
}

// Row types for addresses and cards
interface AddressRow {
    address_id: number;
    user_id: number;
    address_name: string;
    address_street: string;
    address_house_nr: string;
    address_postal_code: string;
    address_city: string;
    address_door: string | null;
    is_default: boolean;
    created_at: Date;
}

interface CardRow {
    card_id: number;
    user_id: number;
    card_name: string;
    card_holder_name: string;
    card_number_last4: string;
    expiry_month: number;
    expiry_year: number;
    card_type: string;
    is_default: boolean;
    created_at: Date;
}

// Helper function to serialize user with admin status, addresses and cards
async function serializeAuthUser(row: UserRowWithPassword): Promise<AuthUserDto> {
    const isAdmin = await isUserAdmin(row.user_id, row.role_id);
    const isRestaurantOwner = row.role_id === ROLE_ID_RESTR_OWNER;
    const warningCount = row.warning_count || 0;
    
    // Fetch all user addresses
    const addressesResult = await pool.query<AddressRow>(
        'SELECT * FROM user_address WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [row.user_id]
    );
    
    const addresses: UserAddressDto[] = addressesResult.rows.map(addr => ({
        id: addr.address_id,
        userId: addr.user_id,
        name: addr.address_name,
        address: {
            street: addr.address_street,
            houseNr: addr.address_house_nr,
            postalCode: addr.address_postal_code,
            city: addr.address_city,
            door: addr.address_door || undefined
        },
        isDefault: addr.is_default,
        createdAt: addr.created_at?.toISOString()
    }));
    
    // Fetch all user payment cards
    const cardsResult = await pool.query<CardRow>(
        'SELECT card_id, user_id, card_name, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at FROM payment_card WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [row.user_id]
    );
    
    const paymentCards: PaymentCardDto[] = cardsResult.rows.map(card => ({
        id: card.card_id,
        userId: card.user_id,
        cardName: card.card_name,
        cardHolderName: card.card_holder_name,
        last4: card.card_number_last4,
        expiryMonth: card.expiry_month,
        expiryYear: card.expiry_year,
        cardType: card.card_type as CardType,
        isDefault: card.is_default,
        createdAt: card.created_at?.toISOString()
    }));
    
    // Get default address for backwards compatibility
    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
    
    const authUser: AuthUserDto = {
        id: row.user_id,
        userName: row.user_name,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        isAdmin,
        isRestaurantOwner,
        warningCount,
        addresses,
        paymentCards
    };
    
    if (defaultAddress?.address) {
        authUser.address = defaultAddress.address;
    }
    
    return authUser;
}

function generateToken(userId: number, roleId: number): string {
    const payload: AuthJwtPayload = {
        userId: userId,
        roleId: roleId,
    }
    const secret = cfg.jwt.secret
    return jwt.sign(payload, secret, {expiresIn: '1h'});
}

// SQL query to get user with all joined data
const USER_SELECT_QUERY = `
    SELECT u.*, r.role_name, us.status_name
    FROM users u
    JOIN role r ON u.role_id = r.role_id
    JOIN user_status us ON u.user_status_id = us.user_status_id
`;

// Login endpoint
router.post("/login", async (req: Request, res: Response) => {
    try {
        const {username, password} = req.body as LoginRequestDto;

        if (!username || !password) {
            return sendBadRequest(res, "Username and password are required");
        }

        // Find user by username or email
        const result = await pool.query<UserRowWithPassword>(
            `${USER_SELECT_QUERY} WHERE u.user_name = $1 OR u.email = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return sendNotFound(res, "Invalid username or password");
        }

        const userRow = result.rows[0]!;

        // Simple password comparison (in production, use bcrypt.compare)
        if (userRow.password_hash !== password) {
            return sendNotFound(res, "Invalid username or password");
        }

        // Check if user is suspended
        if (userRow.status_name === 'suspended') {
            return res.status(403).json({error: "Your account has been suspended. Please contact support for assistance."});
        }

        const user = await serializeAuthUser(userRow);
        const response: AuthResponseDto = {
            user,
            token: generateToken(userRow.user_id, userRow.role_id)
        };
        res.json(response);
    } catch (error) {
        sendInternalError(res, error, "occurred during login");
    }
});

// Register endpoint
router.post("/register", async (req: Request, res: Response) => {
    try {
        const {userName, firstName, lastName, email, phone, password, address} = req.body as RegisterRequestDto;

        if (!userName || !firstName || !lastName || !email || !phone || !password) {
            return sendBadRequest(res, "All fields are required");
        }

        // Check if user already exists
        const existingUser = await pool.query<UserRow>(
            'SELECT 1 FROM users WHERE user_name = $1 OR email = $2',
            [userName, email]
        );

        if (existingUser.rows.length > 0) {
            return sendBadRequest(res, "Username or email already exists");
        }

        // Insert new user with role_id=1 (customer) and user_status_id=1 (ok)
        const result = await pool.query<UserRow>(
            `INSERT INTO users (user_name, first_name, last_name, email, phone, password_hash, role_id, user_status_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [userName, firstName, lastName, email, phone, password, 1, 1]
        );

        const userId = result.rows[0]!.user_id;

        if (address?.street && address?.city) {
            const addressResult = await pool.query<AddressRow>(
                `INSERT INTO user_address (user_id, is_default, address_street, address_house_nr, address_postal_code, address_city, address_door)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [userId, true, address.street, address.houseNr || '', address.postalCode || '', address.city, address.door || null]
            );
        }
        
        // Fetch the complete user with joins
        const userResult = await pool.query<UserRowWithPassword>(
            `${USER_SELECT_QUERY} WHERE u.user_id = $1`,
            [userId]
        );

        const newUserRow = userResult.rows[0]!;
        const user = await serializeAuthUser(newUserRow);
        const response: AuthResponseDto = {
            user,
            token: generateToken(newUserRow.user_id, newUserRow.role_id)
        };
        res.status(201).json(response);
    } catch (error) {
        sendInternalError(res, error, "occurred during registration");
    }
});

// Get current user (for session validation)
router.get("/me", async (req: Request, res: Response) => {
    try {
        const userId = parseTokenUserId(req.headers.authorization);
        if (userId === null) {
            return res.status(401).json({error: "Invalid token"});
        }

        const result = await pool.query<UserRowWithPassword>(
            `${USER_SELECT_QUERY} WHERE u.user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({error: "User not found"});
        }

        const user = await serializeAuthUser(result.rows[0]!);
        res.json(user);
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching user");
    }
});

// Helper function to get user's role_id
async function getUserRoleId(userId: number): Promise<number | null> {
    const result = await pool.query<{role_id: number}>('SELECT role_id FROM users WHERE user_id = $1', [userId]);
    return result.rows[0]?.role_id ?? null;
}

// Add user to admin list (only admins can do this)
router.post("/admins/:userId", async (req: Request, res: Response) => {
    try {
        const currentUserId = parseTokenUserId(req.headers.authorization);
        if (currentUserId === null) {
            return res.status(401).json({error: "Invalid token"});
        }

        // Check if current user is admin
        const currentRoleId = await getUserRoleId(currentUserId);
        const isAdmin = await isUserAdmin(currentUserId, currentRoleId ?? 0);
        if (!isAdmin) {
            return res.status(403).json({error: "Only admins can add other admins"});
        }

        const targetUserId = parseInt(req.params.userId || '');
        if (isNaN(targetUserId)) {
            return sendBadRequest(res, "Invalid user ID");
        }

        // Check if target user exists
        const userExists = await pool.query<{user_status_id: number}>('SELECT user_status_id FROM users WHERE user_id = $1', [targetUserId]);
        if (userExists.rows.length === 0) {
            return sendNotFound(res, "User not found");
        }

        // Check if target user is suspended
        if (userExists.rows[0]!.user_status_id === 3) {
            return sendBadRequest(res, "Cannot make a suspended user an admin");
        }

        // Add to admin list
        await pool.query(
            `INSERT INTO admin_list (user_id, added_by)
             VALUES ($1, $2)
             ON CONFLICT (user_id) DO NOTHING`,
            [targetUserId, currentUserId]
        );

        res.json({message: "User added to admin list"});
    } catch (error) {
        sendInternalError(res, error, "occurred while adding admin");
    }
});

// Remove user from admin list (only admins can do this)
router.delete("/admins/:userId", async (req: Request, res: Response) => {
    try {
        const currentUserId = parseTokenUserId(req.headers.authorization);
        if (currentUserId === null) {
            return res.status(401).json({error: "Invalid token"});
        }

        // Check if current user is admin
        const currentRoleId = await getUserRoleId(currentUserId);
        const isAdmin = await isUserAdmin(currentUserId, currentRoleId ?? 0);
        if (!isAdmin) {
            return res.status(403).json({error: "Only admins can remove other admins"});
        }

        const targetUserId = parseInt(req.params.userId || '');
        if (isNaN(targetUserId)) {
            return sendBadRequest(res, "Invalid user ID");
        }

        // Prevent removing self from admin list
        if (targetUserId === currentUserId) {
            return sendBadRequest(res, "Cannot remove yourself from admin list");
        }

        await pool.query('DELETE FROM admin_list WHERE user_id = $1', [targetUserId]);
        res.json({message: "User removed from admin list"});
    } catch (error) {
        sendInternalError(res, error, "occurred while removing admin");
    }
});

// Get all admins (only admins can view this)
router.get("/admins", async (req: Request, res: Response) => {
    try {
        const currentUserId = parseTokenUserId(req.headers.authorization);
        if (currentUserId === null) {
            return res.status(401).json({error: "Invalid token"});
        }

        // Check if current user is admin
        const currentRoleId = await getUserRoleId(currentUserId);
        const isAdmin = await isUserAdmin(currentUserId, currentRoleId ?? 0);
        if (!isAdmin) {
            return res.status(403).json({error: "Only admins can view admin list"});
        }

        const result = await pool.query<UserRowWithPassword & { added_at: Date }>(
            `SELECT u.*, r.role_name, us.status_name, 
                    ua.address_street, ua.address_house_nr, 
                    ua.address_postal_code, ua.address_city, ua.address_door,
                    al.added_at
             FROM users u
             JOIN role r ON u.role_id = r.role_id
             JOIN user_status us ON u.user_status_id = us.user_status_id
             JOIN admin_list al ON u.user_id = al.user_id
             LEFT JOIN user_address ua ON u.user_id = ua.user_id
             WHERE ua.is_default = true
             ORDER BY al.added_at DESC`
        );

        const admins = await Promise.all(result.rows.map(serializeAuthUser));
        res.json(admins);
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching admins");
    }
});

// Request password reset
router.post("/password-reset-request", async (req: Request, res: Response) => {
    try {
        const {email} = req.body as {email: string};

        if (!email) {
            return sendBadRequest(res, "Email is required");
        }

        // Find user by email
        const result = await pool.query<UserRowWithPassword>(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            // Don't reveal if email exists - just return success
            return res.json({message: "If this email exists, a password reset link has been sent"});
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        // Store token in database
        await pool.query(
            `UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3`,
            [resetToken, expires, email]
        );

        // In production, send email with reset link
        // For now, just return the token (in development only!)
        res.json({
            message: "If this email exists, a password reset link has been sent",
            // Remove this in production - only for testing!
            resetToken
        });
    } catch (error) {
        sendInternalError(res, error, "occurred during password reset request");
    }
});

// Reset password with token
router.post("/password-reset", async (req: Request, res: Response) => {
    try {
        const {token, newPassword} = req.body as {token: string; newPassword: string};

        if (!token || !newPassword) {
            return sendBadRequest(res, "Token and new password are required");
        }

        if (newPassword.length < 4) {
            return sendBadRequest(res, "Password must be at least 4 characters");
        }

        // Find user by reset token
        const result = await pool.query<UserRowWithPassword>(
            `SELECT * FROM users 
             WHERE password_reset_token = $1 
             AND password_reset_expires > NOW()`,
            [token]
        );

        if (result.rows.length === 0) {
            return sendBadRequest(res, "Invalid or expired reset token");
        }

        // Update password and clear reset token
        await pool.query(
            `UPDATE users 
             SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL 
             WHERE user_id = $2`,
            [newPassword, result.rows[0]!.user_id]
        );

        res.json({message: "Password has been reset successfully"});
    } catch (error) {
        sendInternalError(res, error, "occurred during password reset");
    }
});

// Update user profile
router.put("/profile", async (req: Request, res: Response) => {
    try {
        const currentUserId = parseTokenUserId(req.headers.authorization);
        if (currentUserId === null) {
            return res.status(401).json({error: "Invalid token"});
        }

        const {firstName, lastName, email, phone, address} = req.body as UpdateProfileDto;

        // Check if email already exists for another user
        if (email) {
            const existingEmail = await pool.query(
                'SELECT 1 FROM users WHERE email = $1 AND user_id != $2',
                [email, currentUserId]
            );
            if (existingEmail.rows.length > 0) {
                return sendBadRequest(res, "Email already in use by another account");
            }
        }

        // Build dynamic update query for user table
        const updates: string[] = [];
        const values: (string | number | null)[] = [];
        let paramCount = 1;

        if (firstName) {
            updates.push(`first_name = $${paramCount++}`);
            values.push(firstName);
        }
        if (lastName) {
            updates.push(`last_name = $${paramCount++}`);
            values.push(lastName);
        }
        if (email) {
            updates.push(`email = $${paramCount++}`);
            values.push(email);
        }
        if (phone) {
            updates.push(`phone = $${paramCount++}`);
            values.push(phone);
        }

        // Update user table if there are updates
        if (updates.length > 0) {
            values.push(currentUserId);
            await pool.query(
                `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${paramCount}`,
                values
            );
        }

        // Fetch and return updated user
        const result = await pool.query<UserRowWithPassword>(
            `${USER_SELECT_QUERY} WHERE u.user_id = $1`,
            [currentUserId]
        );

        const user = await serializeAuthUser(result.rows[0]!);
        res.json(user);
    } catch (error) {
        sendInternalError(res, error, "occurred while updating profile");
    }
});

// Change password
router.put("/change-password", async (req: Request, res: Response) => {
    try {
        const currentUserId = parseTokenUserId(req.headers.authorization);
        if (currentUserId === null) {
            return res.status(401).json({error: "Invalid token"});
        }

        const {currentPassword, newPassword} = req.body as ChangePasswordDto;

        if (!currentPassword || !newPassword) {
            return sendBadRequest(res, "Current password and new password are required");
        }

        if (newPassword.length < 4) {
            return sendBadRequest(res, "New password must be at least 4 characters");
        }

        // Verify current password
        const result = await pool.query<UserRowWithPassword>(
            'SELECT * FROM users WHERE user_id = $1',
            [currentUserId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({error: "User not found"});
        }

        if (result.rows[0]!.password_hash !== currentPassword) {
            return sendBadRequest(res, "Current password is incorrect");
        }

        // Update password
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE user_id = $2',
            [newPassword, currentUserId]
        );

        res.json({message: "Password changed successfully"});
    } catch (error) {
        sendInternalError(res, error, "occurred while changing password");
    }
});

// Get user's warnings
router.get("/warnings", async (req: Request, res: Response) => {
    try {
        const currentUserId = parseTokenUserId(req.headers.authorization);
        if (!currentUserId) {
            return sendBadRequest(res, "Not authenticated");
        }

        const result = await pool.query<{warning_id: number; reason: string; created_at: Date}>(
            `SELECT warning_id, reason, created_at 
             FROM user_warning 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [currentUserId]
        );

        res.json(result.rows.map(row => ({
            id: row.warning_id,
            reason: row.reason,
            createdAt: row.created_at
        })));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching warnings");
    }
});

// Get user's account status (warning count, status)
router.get("/account-status", async (req: Request, res: Response) => {
    try {
        const currentUserId = parseTokenUserId(req.headers.authorization);
        if (!currentUserId) {
            return sendBadRequest(res, "Not authenticated");
        }

        const result = await pool.query<{warning_count: number; status_name: string}>(
            `SELECT u.warning_count, us.status_name
             FROM users u
             JOIN user_status us ON u.user_status_id = us.user_status_id
             WHERE u.user_id = $1`,
            [currentUserId]
        );

        if (result.rows.length === 0) {
            return sendNotFound(res, "User not found");
        }

        res.json({
            warningCount: result.rows[0]!.warning_count,
            status: result.rows[0]!.status_name
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching account status");
    }
});

export default router;
