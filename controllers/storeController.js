const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer =  require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  filefilter(req, res, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!' }, false);
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index');
}

// generates the form to add a new store 
exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' })
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if(!req.file) {
    next();
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);           // jimp is a promise based function
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
}

// creates new store by adding the store fields in the form
exports.createStore = async (req, res) => {
  const store = new Store(req.body);
  await store.save();
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

// renders all the stores
exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  res.render('editStore', { title: `Edit ${store.name}`, store: store })
}

exports.updateStore = async (req, res) => {
  //set store location type
  console.log(req.body);
  req.body.location.type = 'Point';
  
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body , {
    new: true,
    runValidators: true
  }).exec();

  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`);
  res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if(!store) return next();
  res.render('store', { store, title: store.name });
}

exports.getStoresByTag = async (req, res) => {
  const stores = await Store.getTagsList();
  res.json(stores);
};