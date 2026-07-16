const express = require('express');
const router = express.Router();

const controller = require("../controllers/promotionController");

router.get(
    "/",
    controller.getPromotions
);

router.get(
    "/:id",
    controller.getPromotionById
);

router.post(
    "/",
    controller.createPromotion
);

router.put(
    "/:id",
    controller.updatePromotion
);

router.patch(
    "/:id/status",
    controller.changeStatus
);

module.exports = router;
