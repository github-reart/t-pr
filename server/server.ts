import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 5001;

const pool = new Pool({
    user: 't-pr',
    host: 'localhost',
    database: 't-pr',
    password: 't-pr',
    port: 5432,
});

interface Location {
    name: string;
}

interface Type {
    name: string;
}

app.use(cors());
app.use(express.json());

const getUserId = async (name: string, pass: string): Promise<number | null> => {
    const result = await pool.query('SELECT id FROM users WHERE name = $1 AND pass = $2', [name, pass]);
    return result.rows.length > 0 ? result.rows[0].id : null;
};

const handleError = (res: express.Response, error: any) => {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
};

const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { adminName, adminPass } = req.body;
    const userId = await getUserId(adminName, adminPass);
    if (userId !== 1) {
        return res.status(403).json({ error: 'Access denied.' });
    }
    next();
};

// Применить requireAdmin ко всем маршрутам, кроме '/api/auth'
// app.use(async (req, res, next) => {
//     if (req.path === '/api/auth') {
//         return next();
//     }
//     await requireAdmin(req, res, next);
// });

app.post('/api/auth', async (req, res) => {
    const { name, pass } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE name = $1 AND pass = $2', [name, pass]);
        
        if (result.rows.length > 0) {
            res.status(200).json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Access denied' });
        }
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/users/list', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/users/add', async (req, res) => {
    const { name, pass } = req.body;

    try {
        const result = await pool.query('INSERT INTO users(name, pass) VALUES($1, $2) RETURNING *', [name, pass]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/users/ch', async (req, res) => {
    const { id, pass } = req.body;

    try {
        await pool.query('UPDATE users SET pass = $1 WHERE id = $2', [pass, id]);
        res.status(200).json({ success: true });
    } catch (err) {
        handleError(res, err);
    }
});

app.delete('/api/users/del', async (req, res) => {
    const { id } = req.body;

    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        handleError(res, err);
    }
});


app.post('/api/location/list', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM location ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/location/add', async (req, res) => {
    const locations: { id?: number; name: string }[] = req.body;
    try {
        for (const location of locations) {
            await pool.query('INSERT INTO location(id, name) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name', [location.id, location.name]);
        }
        res.status(201).json({ success: true });
    } catch (err) {
        handleError(res, err);
    }
});

app.delete('/api/location/clear', async (req, res) => {
    try {
        await pool.query('DELETE FROM location');
        await pool.query('ALTER SEQUENCE location_id_seq RESTART WITH 1'); // Сброс автоинкрементации
        res.status(204).send();
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/type/list', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM type');
        res.json(result.rows);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/type/add', async (req, res) => {
    const types: { id?: number; name: string }[] = req.body;
    try {
        for (const type of types) {
            await pool.query('INSERT INTO type(id, name) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name', [type.id, type.name]);
        }
        res.status(201).json({ success: true });
    } catch (err) {
        handleError(res, err);
    }
});

app.delete('/api/type/clear', async (req, res) => {
    try {
        await pool.query('DELETE FROM type');
        await pool.query('ALTER SEQUENCE type_id_seq RESTART WITH 1'); // Сброс автоинкрементации
        res.status(204).send();
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/planned/add', async (req, res) => {
    const { month, planned, location, type } = req.body;
    try {
        const existingRecord = await pool.query(
            'SELECT * FROM planned WHERE month = $1 AND location = $2 AND type = $3',
            [month, location, type]
        );
        if (existingRecord.rows.length > 0) {
            const updatedResult = await pool.query(
                'UPDATE planned SET planned = $1 WHERE month = $2 AND location = $3 AND type = $4 RETURNING *',
                [planned, month, location, type]
            );
            return res.status(200).json(updatedResult.rows[0]);
        } else {
            const insertResult = await pool.query(
                'INSERT INTO planned(month, planned, location, type) VALUES($1, $2, $3, $4) RETURNING *',
                [month, planned, location, type]
            );
            return res.status(201).json(insertResult.rows[0]);
        }
    } catch (err) {
        handleError(res, err);
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
