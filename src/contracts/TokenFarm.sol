pragma solidity ^0.5.16;

import "./MSCoin.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "MSCoin Farm";
    address public owner;
    DaiToken public daiToken;
    MSCoin public mscoin;

    //All stakers
    address[] public stakers;
    //Staking balances of all accounts
    mapping(address => uint) public stakingBalance;
    //All staking accounts [past and present]
    mapping(address => bool) public hasStaked;
    //Existing staking accounts with staked DAI
    mapping(address => bool) public isStaking;

    constructor (MSCoin _mscoin,DaiToken _daitoken) public {
        daiToken = _daitoken;
        mscoin = _mscoin;
        owner = msg.sender;
    }

    //1. Stake Tokens [Deposit]
     function stakeTokens(uint _amount) public {
        // Require amount greater than 0
        require(_amount > 0, "amount cannot be 0");

        // Trasnfer Mock Dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array *only* if they haven't staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }


    //2. UnStake Tokens [Withdraw]
    function unstakeTokens() public {
        //fetch staking balance
        uint balance = stakingBalance[msg.sender];

        require(balance > 0,"Staking balance should be greater than 0");

        //transfer DAI back
        daiToken.transfer(msg.sender, balance);

        //Update staking balance
        stakingBalance[msg.sender] = 0;

        //Update staking status
        isStaking[msg.sender] = false;
    }

    //3. Issue MSCoin Tokens
    function issueTokens() public {
        require(msg.sender == owner,"Tokens should be issued only by owner");
        for (uint i=0; i<stakers.length ; i++){
            address recepient = stakers[i];
            uint balance = stakingBalance[recepient];
            if (balance > 0){
                mscoin.transfer(recepient,balance);
            }
        }
    }

}