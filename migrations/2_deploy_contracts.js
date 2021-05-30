const MSCoin = artifacts.require("MSCoin");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer,network,accounts) {
    //Deploy DAI Token
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();

    //Deploy MSCoin Token
    await deployer.deploy(MSCoin);
    const mSCoin = await MSCoin.deployed();

    //Deploy DAI Token
    await deployer.deploy(TokenFarm,mSCoin.address,daiToken.address);
    const tokenFarm = await TokenFarm.deployed();

    //Transfer all tokens to Token Farm (1 million)
    await mSCoin.transfer(tokenFarm.address,'1000000000000000000000000');

    //Transfer 100 Mock DAI tokens to investor
    await daiToken.transfer(accounts[1],'100000000000000000000'); 
};
