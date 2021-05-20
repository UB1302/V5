const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Review = require('../models/review');
const { isLoggedIn } = require('../middleware');

//Display all the products
router.get('/products', async (req, res) => {

    try {
        const products = await Product.find({});
        res.render('products/index', { products });//not ../products/index because view engine automatically goes to views folder
    } catch (e) {
        console.log('something went wrong');
        req.flash('error', "cannot find products");
        res.render('error');
    }

})

//get the form for new product

router.get('/products/new', isLoggedIn, (req, res) => {

    res.render('products/new');
})

//Create new product

router.post('/products', isLoggedIn, async (req, res) => {


    try {
        await Product.create(req.body.product);
        req.flash('success', 'Product Created Successfully');
        res.redirect('/products');
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot Create Products,Something is Wrong');
        res.render('error');
    }
})

//show particular product

router.get('/products/:id', async (req, res) => {

    try {
        const product = await Product.findById(req.params.id).populate('reviews');
        res.render('products/show', { product });
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot find this Product');
        res.redirect('/error');
    }
})

//to edit product

router.get('/products/:id/edit', isLoggedIn, async (req, res) => {


    try {
        const product = await Product.findById(req.params.id);
        res.render('products/edit', { product });
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot Edit this Product');
        res.redirect('/error');
    }
})

router.patch('/products/:id', isLoggedIn, async (req, res) => {

    try {
        await Product.findByIdAndUpdate(req.params.id, req.body.product);
        req.flash('success', 'Updated Successfully!');
        res.redirect(`/products/${req.params.id}`)
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot update this Product');
        res.redirect('/error');
    }
})


//to delete product
router.delete('/products/:id', isLoggedIn, async (req, res) => {

    try {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success', 'Deleted the product successfully');
        res.redirect('/products');
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot delete this Product');
        res.redirect('/error');
    }
})

//Creating a new review on a product

router.post('/products/:id/review', isLoggedIn, async (req, res) => {

    const product = await Product.findById(req.params.id);
    const review = new Review({
        user: req.user.username,
        ...req.body
    });

    product.reviews.push(review);
    await review.save();
    await product.save();
    res.redirect(`/products/${req.params.id}`);
})
router.get('/error', (req, res) => {
    res.status(404).render('error');
})

module.exports = router;