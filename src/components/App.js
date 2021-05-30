import React, { Component } from 'react'
import Navbar from './Navbar'
import DaiToken from './../abis/DaiToken.json'
import MSCoin from './../abis/MSCoin.json'
import TokenFarm from './../abis/TokenFarm.json'
import Main from './Main.js'
import './App.css'
import Web3 from 'web3';

class App extends Component {

  async componentWillMount() {
    let isAvailable = await this.loadWeb3()
    if(isAvailable)
    await this.loadBlockChainData()
  }

  async loadBlockChainData() {
    const web3 = window.web3

    //Load Accounts
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({account : accounts[0]})

    const networkId = await web3.eth.net.getId()
    console.log("network ID",networkId);

    //Load DAI Token
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData){
      const daiToken = new web3.eth.Contract(DaiToken.abi,daiTokenData.address)
      this.setState({daiToken})
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance : daiTokenBalance.toString() })
    }else{
      window.alert("DAI Token contract could not be deployed")
    }

    //Load MSCoin
    const MSCoinData = MSCoin.networks[networkId]
    if(MSCoinData){
      const mscoin = new web3.eth.Contract(MSCoin.abi,MSCoinData.address)
      this.setState({mscoin})
      let mscoinTokenBalance = await mscoin.methods.balanceOf(this.state.account).call()
      this.setState({ MSCoinBalance : mscoinTokenBalance.toString() })
      console.log(mscoin)
      console.log(mscoinTokenBalance)
    }else{
      window.alert("MSCoin contract could not be deployed")
    }

    //Load TokenFarm
    const TokenFarmData = TokenFarm.networks[networkId]
    if(MSCoinData){
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi,TokenFarmData.address)
      this.setState({tokenFarm})
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance : stakingBalance.toString()  })
    }else{
      window.alert("DAI Token contract could not be deployed")
    }

    this.setState({loading:false})
  }

  stakeTokens = (amount) => {
    this.setState({loading : true})
    this.state.daiToken.methods.approve(this.state.tokenFarm._address,amount).send({from:this.state.account}).on('transactionHash', (hash)=> {
      this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account}).on('transactionHash', async (hash) => {
        await this.loadBlockChainData()
        this.setState({loading:false})
      })
    })
  }
  
  unstakeTokens = (amount) => {
    this.setState({ loading : true})
    this.state.tokenFarm.methods.unstakeTokens().send({from:this.state.account}).on('transactionHash',async (hash)=>{
        await this.loadBlockChainData()
        this.setState({loading:false})
    })
  }

  async loadWeb3(){
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      return true
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
      return true
    }else{
      window.alert("Non-ethereum browser detected ! Try using Metamask Chrome Extention")
      return false
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: '0x0',
      mscoin: '0x0',
      tokenFarm: '0x0',
      daiTokenBalance: '0x0',
      MSCoinBalance: '0x0',
      stakingBalance: '0x0',
      loading: true,
    }
  }

  render() {
    let content
    if(this.state.loading){
      content = <div className="loader text-center" id="loader"></div>
    }else{
      content = <Main 
        daiTokenBalance = {this.state.daiTokenBalance}
        MSCoinBalance = {this.state.MSCoinBalance}
        stakingBalance = {this.state.stakingBalance}
        stakeTokens = {this.stakeTokens}
        unstakeTokens = {this.unstakeTokens}
        loading = {this.state.loading}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
