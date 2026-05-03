const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUser = async () => {
  try {
    console.log('Seeding NeDB...');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@taskflow.com' });
    if (existingUser) {
      console.log('Seed user already exists');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const newUser = await User.insert({
      name: 'Alex Rivera',
      email: 'admin@taskflow.com',
      password: hashedPassword,
      role: 'Admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8SKJw8QDAuQDpcBmO3_s2ckgooED63nign7z0cTVG8IEjL6Eg_WTKOVzw7ioN8_mJQpAVVqtMyNw3PYt75mIIM4tDdZzGtuHCWCyUR61gUnQ_IzrvrZil1CqC0d_hBiuQl7iMZ741GVfrbKWQajQhQYKghROodbH8xETBMhZ8qYIYA3-W7LPdJvpecgOLnsWKX5_J20xh3m5iUNL8kzpx5A8cmoY0HI1R-XkhpGuqzncMqAy7eMVv27jkSfx7FWj84IZZLSaCGCCK',
      createdAt: new Date()
    });

    console.log('Seed user created: admin@taskflow.com / admin123');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUser();
