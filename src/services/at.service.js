const { punches } = require('../models')

const addPunchesData = async (puchData) => {
    for (let punch of puchData) {
        const d = await punches.create(punch);
        //await punches.create(punch);
    }
    return;
}
module.exports = {
  addPunchesData,
};