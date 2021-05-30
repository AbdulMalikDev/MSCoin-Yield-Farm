const MSCoin = artifacts.require("MSCoin");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
.use(require('chai-as-promised'))
.should()

function tokens(n){
    return web3.utils.toWei(n,'ether')
}

contract('TokenFarm',([owner,investor]) => {
    let daiToken , mscoin , tokenFarm

    before(async () => {
        daiToken = await DaiToken.new()
        mscoin = await MSCoin.new()
        tokenFarm = await TokenFarm.new(mscoin.address,daiToken.address)

        //Transfer MSCoin to farm
        await mscoin.transfer(tokenFarm.address,tokens('1000000'))

        await daiToken.transfer(investor,tokens('100'),{from : owner})
    })
    
    describe('Mock Dai Deployment', async () => {
        it('has a name', async ()=>{
            const name = await daiToken.name()
            assert.equal(name,'Mock DAI Token')
        })
    })

    describe('MSCoin Deployment', async () => {
        it('has a name', async ()=>{
            const name = await mscoin.name()
            assert.equal(name,'MSCoin')
        })
    })

    describe('Token Farm Deployment', async () => {
        it('has a name', async ()=>{
            const name = await tokenFarm.name()
            assert.equal(name,'MSCoin Farm')
        })

        it('contract has tokens',async () => {
            //The token farm needs to have 1M coins of MSCoin
            let balance = await mscoin.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(),tokens('1000000'))
        })
    })

    describe('Farming tokens', () => {
        it('rewards investors for staking mDai tokens',async ()=>{
            let result;

            //Check investor balance before staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(),tokens('100'),'investor Mock DAI wallet balance correct before staking')

            //Stake Mock DAI Tokens
            await daiToken.approve(tokenFarm.address,tokens('100'),{from:investor})
            await tokenFarm.stakeTokens(tokens('100'),{from:investor})

            //Check staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('0'),'investor Mock DAI wallet balance correct after staking')
            
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),tokens('100'),'tokenFarm Mock DAI wallet balance correct after staking')
            
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),tokens('100'),'investor staking balance correct after staking')
            
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),'true','tokenFarm Mock DAI wallet should be included in isStaking list')

            //Issue Tokens
            await tokenFarm.issueTokens({ from : owner})

            //Check if investor issued 100 MSCoins for staking 100 Mock Dai Tokens
            result = await mscoin.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),'Investor should receive 100 MSCoins for staking 100 Mock Dai tokens')
            
            //Unstake tokens
            await tokenFarm.unstakeTokens({from: investor})

            //Check result after staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),'investor should get back their 100 DAI after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),tokens('0'),'Token farm should not have any DAI after unstaking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),tokens('0'),'investor staking balance correct after staking')

            

        })
    })
    
    
})