const express = require('express');
const { syncDatabase } = require('./models');
const userRoutes = require('./routes/userRoutes');

require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Capsule Hotel API running.')
});

// syncDatabase(); //Database senkronizasyonu için 

app.use('/api', userRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}.`);
}) 