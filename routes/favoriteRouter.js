const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));

    })

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            req.body.forEach(fav => {
                if (!favorite.campsites.includes(fav._id)) {
                    favorite.campsites.push(fav._id);
                }
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            Favorite.create({ user: req.user._id, campsites:req.body})
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
            
        })
        .catch(err => next(err));
    })
        .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favorites');
        })

        .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                favorite.remove()
                .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
                })
                .catch(err => next(err));    
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You do not have any favorites to delete.');
            }
        })
        .catch(err => next(err));
    });

    favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorites/ ${req.params.campsiteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user:req.user._id})
        .then(favorite => {
            // is the campsite already in the user's favorite document
            if(favorite) {
                if (!favorite.campsites.includes(req.params.campsiteId)) {
                    favorite.campsites.push(req.params.campsiteId);
                    favorite.save()
                    .then(favorite => {
                        res.statuscode=200;
                        res.setHeader('Content-Type', 'application/jason');
                        res.json(favorite);
                    })
                    .catch(err => next(err));
                    // if not let's add the campsite to the user's favorite document
                } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end("That campsite is already a favorite");
                    }        
            } else {
                Favorite.create ({ user:req.user._id, Campsites: [req.params.campsiteId] } )
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
         })
        .catch(err => next(err));
        })
            
// the user didn't have a favorite document so we will create one and add the campsite

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites / ${req.params.campsiteId}`);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
    .then(favorite => {
        if(favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            if (index > 0) {
                favorite.campsites.splice(index, 1);
            }    
            favorite.save()
            .then(favorite => {
                Favorite.findById (favorite._id)
                .then(favorite => { 
                    res.statusCode = 200;
                    res.setHeader('Content-type', 'application/json');
                    res.json(favorite);
                })

            }) 
            .catch(err => next(err));
        
        } else {
            res.statusCode = 200;
            res.SetHeader ('Content-Type', 'application/json')
            res.end('You have no favorites to delete')
            }
    }) 
    .catch(err => next(err))
});            

module.exports = favoriteRouter;