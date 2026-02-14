import cfg from '../../config.json';
import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";

const secret = cfg.jwt.secret;

const ADMIN_ROLE_ID = 3

export type AuthJwtPayload = {
    userId: number,
    roleId: number,
}

export function requiresAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const payload = authHeaderToPayload(authHeader);
    if (!payload || payload.roleId !== ADMIN_ROLE_ID) {
        return res.status(403).json({message: "Token invalid"});
    }

    next();
    return;
}

export function requiresAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    try {
        jwt.verify(getTokenFromAuthHeader(authHeader), secret);
    }
    catch (error) {
        return res.status(403).json({message: "Token invalid"});
    }
    next();
    return;
}

function getTokenFromAuthHeader(authHeader: string | undefined) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return "";
    }
    return authHeader.substring(7);
}

function authHeaderToPayload(authHeader: string | undefined) {
    const token = getTokenFromAuthHeader(authHeader);
    if (!token) return null;
    try {
        return jwt.verify(token, secret) as AuthJwtPayload;
    }
    catch (error) {
        return null;
    }
}

export function parseTokenUserId(authHeader: string | undefined): number | null {
    const payload = authHeaderToPayload(authHeader);
    if (!payload) return null;

    const userId = payload.userId;
    return isNaN(userId) ? null : userId;
}