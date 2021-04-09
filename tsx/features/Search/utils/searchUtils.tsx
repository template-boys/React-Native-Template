const one = require("../static/1.png");
const oneHalf = require("../static/1.5.png");
const two = require("../static/2.png");
const twoHalf = require("../static/2.5.png");
const three = require("../static/3.png");
const threeHalf = require("../static/3.5.png");
const four = require("../static/4.png");
const fourHalf = require("../static/4.5.png");
const five = require("../static/5.png");

export const getRatingImage = (rating) => {
  let imageSource;
  if (rating === 1) {
    imageSource = one;
  } else if (rating === 1.5) {
    imageSource = oneHalf;
  } else if (rating === 2) {
    imageSource = two;
  } else if (rating === 2.5) {
    imageSource = twoHalf;
  } else if (rating === 3) {
    imageSource = three;
  } else if (rating === 3.5) {
    imageSource = threeHalf;
  } else if (rating === 4) {
    imageSource = four;
  } else if (rating === 4.5) {
    imageSource = fourHalf;
  } else {
    imageSource = five;
  }
  return imageSource;
};