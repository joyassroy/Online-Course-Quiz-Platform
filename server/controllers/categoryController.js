// @desc    Create a new Category
// @route   POST /api/admin/categories
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const created_by = req.user.id; // Token থেকে অ্যাডমিনের ID নিচ্ছি

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        // ক্যাটাগরি আগে থেকেই আছে কি না চেক করা (Fast query using UNIQUE index)
        const [existing] = await req.db.query('SELECT id FROM Categories WHERE name = ?', [name]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Category already exists.' });
        }

        const [result] = await req.db.query(
            'INSERT INTO Categories (name, description, created_by) VALUES (?, ?, ?)',
            [name, description || null, created_by]
        );

        res.status(201).json({
            success: true,
            message: 'Category created successfully!',
            categoryId: result.insertId
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server error while creating category.' });
    }
};

// @desc    Get all Categories (Optimized for Fast Response)
// @route   GET /api/admin/categories
exports.getAllCategories = async (req, res) => {
    try {
        // শুধু দরকারি কলামগুলো আনছি, যাতে রেসপন্স সাইজ ছোট হয় এবং স্পিড বাড়ে
        const [categories] = await req.db.query(
            `SELECT c.id, c.name, c.description, c.status, c.created_at, u.full_name as created_by_name 
             FROM Categories c 
             LEFT JOIN Users u ON c.created_by = u.id 
             ORDER BY c.name ASC`
        );

        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching categories.' });
    }
};

// @desc    Update a Category
// @route   PUT /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        const [result] = await req.db.query(
            'UPDATE Categories SET name = COALESCE(?, name), description = COALESCE(?, description), status = COALESCE(?, status) WHERE id = ?',
            [name, description, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.status(200).json({ success: true, message: 'Category updated successfully!' });
    } catch (error) {
        // ডুপ্লিকেট নামের এরর হ্যান্ডেলিং
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Category name already exists.' });
        }
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Server error while updating category.' });
    }
};