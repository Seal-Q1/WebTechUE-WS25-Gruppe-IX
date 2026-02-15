import {Router, type Request, type Response} from 'express';
import pool from '../pool';
import {sendInternalError, sendBadRequest, requiresAuth} from '../utils';
import type {
    UserAddressDto, 
    CreateUserAddressDto, 
    UpdateUserAddressDto,
    PaymentCardDto,
    CreatePaymentCardDto,
    UpdatePaymentCardDto,
    CardType,
    AddressDto
} from '@shared/types';

const router = Router();

// ===================
// HELPER FUNCTIONS
// ===================

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

function serializeAddress(row: AddressRow): UserAddressDto {
    return {
        id: row.address_id,
        userId: row.user_id,
        name: row.address_name,
        address: {
            street: row.address_street,
            houseNr: row.address_house_nr,
            postalCode: row.address_postal_code,
            city: row.address_city,
            door: row.address_door || undefined
        },
        isDefault: row.is_default,
        createdAt: row.created_at?.toISOString()
    };
}

function serializeCard(row: CardRow): PaymentCardDto {
    return {
        id: row.card_id,
        userId: row.user_id,
        cardName: row.card_name,
        cardHolderName: row.card_holder_name,
        last4: row.card_number_last4,
        expiryMonth: row.expiry_month,
        expiryYear: row.expiry_year,
        cardType: row.card_type as CardType,
        isDefault: row.is_default,
        createdAt: row.created_at?.toISOString()
    };
}

// Detect card type from number
function detectCardType(cardNumber: string): CardType {
    const num = cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6(?:011|5)/.test(num)) return 'discover';
    return 'other';
}

// ===================
// ADDRESS ROUTES
// ===================

// Get all addresses for current user
router.get("/addresses", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const result = await pool.query<AddressRow>(
            'SELECT * FROM user_address WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
            [userId]
        );

        res.json(result.rows.map(serializeAddress));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching addresses");
    }
});

// Get single address
router.get("/addresses/:addressId", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {addressId} = req.params;
        const result = await pool.query<AddressRow>(
            'SELECT * FROM user_address WHERE address_id = $1 AND user_id = $2',
            [addressId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Address not found"});
        }

        res.json(serializeAddress(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching address");
    }
});

// Create new address
router.post("/addresses", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {name, address, isDefault} = req.body as CreateUserAddressDto;

        if (!name || !address?.street || !address?.city || !address?.houseNr || !address?.postalCode) {
            return sendBadRequest(res, "Name, street, house number, postal code and city are required");
        }

        const result = await pool.query<AddressRow>(
            `INSERT INTO user_address (user_id, address_name, address_street, address_house_nr, address_postal_code, address_city, address_door, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [userId, name, address.street, address.houseNr, address.postalCode, address.city, address.door || null, isDefault ?? false]
        );

        res.status(201).json(serializeAddress(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while creating address");
    }
});

// Update address
router.put("/addresses/:addressId", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {addressId} = req.params;
        const {name, address, isDefault} = req.body as UpdateUserAddressDto;

        // Verify ownership
        const existing = await pool.query(
            'SELECT 1 FROM user_address WHERE address_id = $1 AND user_id = $2',
            [addressId, userId]
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({error: "Address not found"});
        }

        // Build dynamic update
        const updates: string[] = [];
        const values: (string | number | boolean | null)[] = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`address_name = $${paramCount++}`);
            values.push(name);
        }
        if (address?.street !== undefined) {
            updates.push(`address_street = $${paramCount++}`);
            values.push(address.street);
        }
        if (address?.houseNr !== undefined) {
            updates.push(`address_house_nr = $${paramCount++}`);
            values.push(address.houseNr);
        }
        if (address?.postalCode !== undefined) {
            updates.push(`address_postal_code = $${paramCount++}`);
            values.push(address.postalCode);
        }
        if (address?.city !== undefined) {
            updates.push(`address_city = $${paramCount++}`);
            values.push(address.city);
        }
        if (address?.door !== undefined) {
            updates.push(`address_door = $${paramCount++}`);
            values.push(address.door || null);
        }
        if (isDefault !== undefined) {
            updates.push(`is_default = $${paramCount++}`);
            values.push(isDefault);
        }

        if (updates.length === 0) {
            return sendBadRequest(res, "No fields to update");
        }

        values.push(parseInt(addressId as string));
        const result = await pool.query<AddressRow>(
            `UPDATE user_address SET ${updates.join(', ')} WHERE address_id = $${paramCount} RETURNING *`,
            values
        );

        res.json(serializeAddress(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while updating address");
    }
});

// Delete address
router.delete("/addresses/:addressId", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {addressId} = req.params;
        const result = await pool.query(
            'DELETE FROM user_address WHERE address_id = $1 AND user_id = $2 RETURNING address_id',
            [addressId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Address not found"});
        }

        res.json({message: "Address deleted successfully"});
    } catch (error) {
        sendInternalError(res, error, "occurred while deleting address");
    }
});

// Set default address
router.post("/addresses/:addressId/set-default", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {addressId} = req.params;
        const result = await pool.query<AddressRow>(
            'UPDATE user_address SET is_default = TRUE WHERE address_id = $1 AND user_id = $2 RETURNING *',
            [addressId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Address not found"});
        }

        res.json(serializeAddress(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while setting default address");
    }
});

// ===================
// PAYMENT CARD ROUTES
// ===================

// Get all cards for current user
router.get("/cards", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const result = await pool.query<CardRow>(
            'SELECT card_id, user_id, card_name, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at FROM payment_card WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
            [userId]
        );

        res.json(result.rows.map(serializeCard));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching cards");
    }
});

// Get single card
router.get("/cards/:cardId", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {cardId} = req.params;
        const result = await pool.query<CardRow>(
            'SELECT card_id, user_id, card_name, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at FROM payment_card WHERE card_id = $1 AND user_id = $2',
            [cardId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Card not found"});
        }

        res.json(serializeCard(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching card");
    }
});

// Add new card
router.post("/cards", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {cardName, cardHolderName, cardNumber, expiryMonth, expiryYear, cvv, isDefault} = req.body as CreatePaymentCardDto;

        // Validation
        if (!cardHolderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
            return sendBadRequest(res, "Card holder name, card number, expiry date, and CVV are required");
        }

        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            return sendBadRequest(res, "Invalid card number");
        }

        if (expiryMonth < 1 || expiryMonth > 12) {
            return sendBadRequest(res, "Invalid expiry month");
        }

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            return sendBadRequest(res, "Card has expired");
        }

        // Extract last 4 digits and detect card type
        const last4 = cleanCardNumber.slice(-4);
        const cardType = detectCardType(cleanCardNumber);

        // In a real app, the card would be tokenized via a payment processor (Stripe, etc.)
        // Here we just store a hash placeholder
        const cardNumberHash = `hash_${cleanCardNumber}`;

        const result = await pool.query<CardRow>(
            `INSERT INTO payment_card (user_id, card_name, card_holder_name, card_number_last4, card_number_hash, expiry_month, expiry_year, card_type, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING card_id, user_id, card_name, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at`,
            [userId, cardName || 'My Card', cardHolderName, last4, cardNumberHash, expiryMonth, expiryYear, cardType, isDefault ?? false]
        );

        res.status(201).json(serializeCard(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while adding card");
    }
});

// Update card
router.put("/cards/:cardId", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {cardId} = req.params;
        const {cardName, cardHolderName, expiryMonth, expiryYear, isDefault} = req.body as UpdatePaymentCardDto;

        // Verify ownership
        const existing = await pool.query(
            'SELECT 1 FROM payment_card WHERE card_id = $1 AND user_id = $2',
            [cardId, userId]
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({error: "Card not found"});
        }

        // Build dynamic update
        const updates: string[] = [];
        const values: (string | number | boolean)[] = [];
        let paramCount = 1;

        if (cardName !== undefined) {
            updates.push(`card_name = $${paramCount++}`);
            values.push(cardName);
        }
        if (cardHolderName !== undefined) {
            updates.push(`card_holder_name = $${paramCount++}`);
            values.push(cardHolderName);
        }
        if (expiryMonth !== undefined) {
            updates.push(`expiry_month = $${paramCount++}`);
            values.push(expiryMonth);
        }
        if (expiryYear !== undefined) {
            updates.push(`expiry_year = $${paramCount++}`);
            values.push(expiryYear);
        }
        if (isDefault !== undefined) {
            updates.push(`is_default = $${paramCount++}`);
            values.push(isDefault);
        }

        if (updates.length === 0) {
            return sendBadRequest(res, "No fields to update");
        }

        values.push(parseInt(cardId as string));
        const result = await pool.query<CardRow>(
            `UPDATE payment_card SET ${updates.join(', ')} WHERE card_id = $${paramCount} 
             RETURNING card_id, user_id, card_name, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at`,
            values
        );

        res.json(serializeCard(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while updating card");
    }
});

// Delete card
router.delete("/cards/:cardId", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {cardId} = req.params;
        const result = await pool.query(
            'DELETE FROM payment_card WHERE card_id = $1 AND user_id = $2 RETURNING card_id',
            [cardId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Card not found"});
        }

        res.json({message: "Card deleted successfully"});
    } catch (error) {
        sendInternalError(res, error, "occurred while deleting card");
    }
});

// Set default card
router.post("/cards/:cardId/set-default", requiresAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const {cardId} = req.params;
        const result = await pool.query<CardRow>(
            `UPDATE payment_card SET is_default = TRUE WHERE card_id = $1 AND user_id = $2 
             RETURNING card_id, user_id, card_name, card_holder_name, card_number_last4, expiry_month, expiry_year, card_type, is_default, created_at`,
            [cardId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Card not found"});
        }

        res.json(serializeCard(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while setting default card");
    }
});

export default router;
