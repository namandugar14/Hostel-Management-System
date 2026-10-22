const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { sendPasswordResetEmail } = require('../services/emailService');

exports.register = async (req, res) => {
    const { name, email, password, course, gender, year_of_study, role, hostel_id } = req.body;

    if (!name || !email || !password || !gender || !year_of_study) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const [existing] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole = role || 'Student';
        const userHostelId = hostel_id || null;

        await db.execute(
            'INSERT INTO users (name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, userRole, course || 'None', gender, parseInt(year_of_study), userHostelId]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, name: user.name, hostel_id: user.hostel_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                course: user.course,
                hostel_id: user.hostel_id
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, role, course, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Please enter your registered email address' });
    }

    try {
        const [users] = await db.execute('SELECT id, name, email FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'No account found with this email address' });
        }

        const user = users[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

        // Remove any previous active tokens for this email
        await db.execute('DELETE FROM password_resets WHERE email = ?', [user.email]);

        // Insert new token
        await db.execute(
            'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
            [user.email, token, expiresAt]
        );

        // Build reset URL
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5001';
        const clientOrigin = req.get('origin') || `${protocol}://${host}`;
        const resetUrl = `${clientOrigin}/#!/reset-password?token=${token}`;

        const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl, token);

        res.json({
            message: 'A password reset link has been sent to your email address.',
            simulated: !!emailResult.simulated,
            fallback: !!emailResult.fallback,
            previewUrl: emailResult.previewUrl,
            resetUrl: (emailResult.simulated || emailResult.fallback) ? resetUrl : undefined
        });

    } catch (err) {
        console.error('Error in forgotPassword:', err);
        res.status(500).json({ error: 'Failed to process password reset request. Please try again later.' });
    }
};

exports.verifyResetToken = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ valid: false, error: 'Reset token is required' });
    }

    try {
        const [rows] = await db.execute(
            'SELECT email, expires_at FROM password_resets WHERE token = ?',
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({ valid: false, error: 'Password reset link is invalid or has already been used.' });
        }

        const resetRecord = rows[0];
        if (new Date(resetRecord.expires_at) < new Date()) {
            await db.execute('DELETE FROM password_resets WHERE token = ?', [token]);
            return res.status(400).json({ valid: false, error: 'Password reset link has expired. Please request a new one.' });
        }

        res.json({
            valid: true,
            email: resetRecord.email
        });

    } catch (err) {
        console.error('Error in verifyResetToken:', err);
        res.status(500).json({ valid: false, error: 'Internal server error while verifying token.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        const [rows] = await db.execute(
            'SELECT email, expires_at FROM password_resets WHERE token = ?',
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Password reset link is invalid or has already been used.' });
        }

        const resetRecord = rows[0];
        if (new Date(resetRecord.expires_at) < new Date()) {
            await db.execute('DELETE FROM password_resets WHERE token = ?', [token]);
            return res.status(400).json({ error: 'Password reset link has expired. Please request a new one.' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, resetRecord.email]);

        // Invalidate token
        await db.execute('DELETE FROM password_resets WHERE email = ?', [resetRecord.email]);

        res.json({
            message: 'Your password has been reset successfully! You can now sign in with your new password.'
        });

    } catch (err) {
        console.error('Error in resetPassword:', err);
        res.status(500).json({ error: 'Failed to reset password. Please try again later.' });
    }
};

