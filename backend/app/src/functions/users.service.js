const User = require('../models/UserScheme');

const getUserByName = async (name) => {
    if (!name) throw new Error('Name is required');
    
    try {
        const user = await User.findOne({ name });
        return user || null;
    } catch (error) {
        throw new Error(error.message);
    }
}
const getAllUsers = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (error) {
        throw new Error(error.message);
    }
}
const getUserByEmail = async (email) => {
    if (!email) throw new Error('Email is required');
    try {
        const user = await User.findOne({ email });
        return user || null;
    } catch (error) {
        throw new Error(error.message);
    }
}
const getUserById = async (id) => {
    if (!id) throw new Error('Id is required');
    try {
        const user = await User.findById(id).populate({
            path: 'orders',
            populate: {
                path: 'books',
                model: 'book'
            }
        });
        return user || null;
    } catch (error) {
        throw new Error(error.message);
    }
}
const createUser = async (userData) => {
    if (!userData) throw new Error('User data is required');
    
    const { name, email, password } = userData;
    if (!name || !email || !password) {
        throw new Error('Name, email, and password are required');
    }

    try {
        if (await getUserByEmail(email)) {
            throw new Error('Email already exists');
        }

        const newUser = new User({ name, email, password });
        await newUser.save();
        return newUser;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteUser = async (id) => {
    if (!id) throw new Error('Id is required');
    try {
        const user = await User.findByIdAndDelete(id);
        return user || null;
    } catch (error) {
        throw new Error(error.message);
    }
}
const updateUser = async (id, updatedUserData) => {
    if (!id || !updatedUserData) throw new Error('Id and updated user data are required');
    
    try {
        const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });
        return updatedUser || null;
    } catch (error) {
        throw new Error(error.message);
    }
}
const addOrderToUser = async (id, orderID) => {
    if (!id || !orderID) throw new Error('User ID and Order ID are required');
    try {
        const user = await User.findById(id);
        if (!user) throw new Error('User not found');

        user.orders.push(orderID);
        await updateUser(id, user);
        return orderID;
    } catch (error) {
        throw new Error(error.message);
    }
}
const addBooksToUser = async (id, books) => {
    if (!id || !books || !books.length) throw new Error('User ID and books are required');
    try {
        const user = await User.findById(id);
        if (!user) throw new Error('User not found');

        user.books.push(...books);
        await updateUser(id, user);
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}
module.exports = {
    addOrderToUser,
    addBooksToUser,
    getAllUsers,
    getUserById,
    getUserByName,
    getUserByEmail,
    createUser,
    deleteUser,
    updateUser
}