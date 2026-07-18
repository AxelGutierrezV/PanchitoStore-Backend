const express = require('express');
const router = express.Router();

const controller = require("../controllers/promotionController");

router.get(
  "/",
  controller.getPromotions
);


router.get("/:id/products",
  controller.getPromotionProducts
);

router.get(
  "/:id",
  controller.getPromotionById
);

router.post(
  "/",
  controller.createPromotion
);

router.put("/:id",
  controller.updatePromotion
);


router.post(
  "/:id/products",
  controller.assignProducts
);


router.patch(
  "/:id/status",
  controller.changeStatus
);


router.put(
  "/:id/products",
  controller.replaceProducts
);


module.exports = router;

