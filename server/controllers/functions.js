import jwt from"jsonwebtoken";

export function generateAccessToken(login) {
    const payload = { login };
    return jwt.sign(payload, process.env.SECRET_ACCESS_KEY, { expiresIn: "24h" });
}
