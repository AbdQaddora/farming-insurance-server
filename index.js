const ethers = require('ethers');
const CONTRACT_API = require('./contractApi.js')
const PRIVATE_KEY = "71192909a65d0a0355a16be663d3e7bc589c61af088e0993f82b8dd815198a21"
const CONTRACT_ADDRESS = '0x2089aE2c0e845fD5299364fD72083097A411B6E4';
const Provider = new ethers.providers.InfuraProvider("ropsten");

console.log("our server is started working now 🎉");
setInterval(() => runEveryDay(CONTRACT_ADDRESS, PRIVATE_KEY), 1000 * 60 * 60 * 24);

async function runEveryDay(CONTRACT_ADDRESS, PRIVATE_KEY) {
    // runEveryDayAndSendInsuranceValues
    const wallet = new ethers.Wallet(PRIVATE_KEY);
    const signer = wallet.connect(Provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_API, signer);

    // get all subscribers today is the end subscription duration date for him
    const arrayOfSubscribers = await contract.getEndDayEqToday();
    const arrayOfLocations = arrayOfSubscribers.map(el => el.location);

    // to send ethers with function calling
    const options = { value: ethers.utils.parseEther(`${calcCost(arrayOfSubscribers)}`) };

    // runEveryDayAndSendInsuranceValues function from the smart contract will send insurance value
    //  for customers whose rainfall average in their location is less than 30%.
    const tx = await contract.runEveryDayAndSendInsuranceValues(getWetherInfo(arrayOfLocations), options);
    console.log(tx);
}

// this function calc cost to send it with transaction to runEveryDayAndSendInsuranceValues method in smart contract
function calcCost(arrayOfSubscribers) {
    const arrayOfRainFallAVGs = getWetherInfo(arrayOfSubscribers);
    let cost = 0;
    for (let i = 0; i < arrayOfRainFallAVGs.length; i++) {
        if (arrayOfRainFallAVGs[i] < 30) {
            cost += (arrayOfSubscribers[i].landArea * 2) / 1000; //insurance value for 1000 meters is 2 ETH 
        }
    }
    return cost;
}

// This function is supposed to return real data from an API about rainfall percentages in the last month
// at the locations that exist in the subscriber list,
// but unfortunately we couldn't find any free API doing this 🤷‍♂️, 
// so we randomized any numbers as rainfall percentages.
function getWetherInfo(arrayOfLocations) {
    const resultArrayOfRainfallPercentages = [];
    for (let i = 0; i < arrayOfLocations.length; i++) {
        // const element = arrayOfLocations[i];
        const temp = Math.ceil(Math.random() * 90);
        resultArrayOfRainfallPercentages[i] = temp;
    }
    return resultArrayOfRainfallPercentages;
}

