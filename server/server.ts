import express from 'express';
import cors from 'cors';
import { pool } from './database';

const app = express();
const PORT = process.env.PORT || 5001;

interface News {
    id?: number;
    location: number;
    publicationdate: string;
    title: string;
    source: number;
    link: string;
    type: number;
    theme: number;
    emotional: number;
}

interface Planned {
    month: string;
    planned: number;
    location: number;
    type: number;
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

const requireUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { adminName, adminPass } = req.body;
    const userId = await getUserId(adminName, adminPass);
    if (!userId) {
        return res.status(403).json({ error: 'Access denied.' });
    }
    next();
};

const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { adminName, adminPass } = req.body;
    const userId = await getUserId(adminName, adminPass);
    if (userId !== 1) {
        return res.status(403).json({ error: 'Access denied.' });
    }
    next();
};

// Проверка доступов 
app.use(async (req, res, next) => {
    // Не требуют авторизации
    const allowedPaths = ['/api/auth', '/api/planned', '/api/news', '/api/location/list',
        '/api/type/list'
    ];
    if (allowedPaths.includes(req.path)) {
        return next();
    }
    // Только для администратора
    if (req.path.startsWith('/api/users/')) {
        await requireAdmin(req, res, next);
    } else { // Все остальные требуют авторизации
        await requireUser(req, res, next);
    }
});



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

app.post('/api/planned', async (req, res) => {
    const { from, to } = req.body;
    try {
        const result = await pool.query(
            `SELECT * FROM planned WHERE TO_DATE(month, 'YYYY-MM') BETWEEN $1 AND $2`,
            [from, to]
        );
        res.json(result.rows);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/planned/add', async (req, res) => {
    const { month, planned, location, type }: Planned = req.body;
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

app.delete('/api/planned/del', async (req, res) => {
    const { location, type, month } = req.body;

    try {
        await pool.query('DELETE FROM planned WHERE location = $1 AND type = $2 AND month = $3', [location, type, month]);
        res.status(204).send();
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/news', async (req, res) => {
    const { from, to } = req.body;
    let query = 'SELECT * FROM news WHERE 1=1';
    const params = [];

    if (from && to) {
        query += ' AND publicationdate BETWEEN $1 AND $2';
        params.push(from, to);
    } else if (from) {
        query += ' AND publicationdate >= $1';
        params.push(from);
    } else if (to) { 
        query += ' AND publicationdate <= $1';
        params.push(to);
    }

    query += ' ORDER BY publicationdate DESC';

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/news/add', async (req, res) => {
    const news: News = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO news(location, publicationdate, title, source, link, type, theme, emotional) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [news.location, news.publicationdate, news.title, news.source, news.link, news.type, news.theme, news.emotional]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        handleError(res, err);
    }
});

app.put('/api/news/update/:id', async (req, res) => {
    const { id } = req.params;
    const news: News = req.body;
    try {
        const result = await pool.query(
            'UPDATE news SET location = $1, publicationdate = $2, title = $3, source = $4, link = $5, type = $6, theme = $7, emotional = $8 WHERE id = $9 RETURNING *',
            [news.location, news.publicationdate, news.title, news.source, news.link, news.type, news.theme, news.emotional, id]
        );
        return res.status(200).json(result.rows[0]);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/news/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'News not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        handleError(res, err);
    }
});

app.delete('/api/news/del', async (req, res) => {
    const { id } = req.body;

    try {
        await pool.query('DELETE FROM news WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        handleError(res, err);
    }
});


app.post('/api/users/list', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY ID ASC');
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

app.post('/api/location/edit', async (req, res) => {
    const { values } = req.body;
    const locations: { id?: number; name: string }[] = values;
    try {
        await pool.query('DELETE FROM location');
        await pool.query('ALTER SEQUENCE location_id_seq RESTART WITH 1'); // Сброс автоинкрементации
        for (const location of locations) {
            await pool.query('INSERT INTO location(id, name) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name', [location.id, location.name]);
        }
        res.status(201).json({ success: true });
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

app.post('/api/type/edit', async (req, res) => {
    const { values } = req.body;
    const types: { id?: number; name: string }[] = values;
    try {
        await pool.query('DELETE FROM type');
        await pool.query('ALTER SEQUENCE type_id_seq RESTART WITH 1');
        for (const type of types) {
            await pool.query('INSERT INTO type(id, name) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name', [type.id, type.name]);
        }
        res.status(201).json({ success: true });
    } catch (err) {
        handleError(res, err);
    }
});


app.post('/api/source/list', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM source ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/source/edit', async (req, res) => {
    const { values } = req.body;    
    const sources: { id?: number; name: string }[] = values;
    try {
        await pool.query('DELETE FROM source');
        await pool.query('ALTER SEQUENCE source_id_seq RESTART WITH 1');
        for (const source of sources) {
            await pool.query('INSERT INTO source(id, name) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name', [source.id, source.name]);
        }
        res.status(201).json({ success: true });
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/theme/list', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM theme');
        res.json(result.rows);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/theme/edit', async (req, res) => {
    const { values } = req.body;  
    const themes: { id?: number; name: string }[] = values;
    try {
        await pool.query('DELETE FROM theme');
        await pool.query('ALTER SEQUENCE theme_id_seq RESTART WITH 1');
        for (const theme of themes) {
            await pool.query('INSERT INTO theme(id, name) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name', [theme.id, theme.name]);
        }
        res.status(201).json({ success: true });
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/emotional/list', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM emotional');
        res.json(result.rows);
    } catch (err) {
        handleError(res, err);
    }
});

app.post('/api/emotional/edit', async (req, res) => {
    const { values } = req.body;  
    const emotionals: { id?: number; name: string }[] = values;
    try {
        await pool.query('DELETE FROM emotional');
        await pool.query('ALTER SEQUENCE emotional_id_seq RESTART WITH 1');
        for (const emotional of emotionals) {
            await pool.query('INSERT INTO emotional(id, name) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name', [emotional.id, emotional.name]);
        }
        res.status(201).json({ success: true });
    } catch (err) {
        handleError(res, err);
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
