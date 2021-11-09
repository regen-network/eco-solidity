// SPDX-License-Identifier:  Apache-2.0

pragma solidity ^0.8.4;

import "./Ownable.sol";
import "./openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Static price shop for buying basket tokens.
 *
 */
contract Shop is Ownable {
    // erc20 basket -> basket token price in USD.
    mapping(address => uint256) public prices;
    mapping(address => uint256) public amounts;

    // address of the Regen treasury (an address where the tokens can be
    address public treasury;

    // address of the usdToken
    address public usdToken;

    bool public locked;

    constructor(address owner_, address treasury_) Ownable(owner_) {
        treasury = treasury_;
        locked = false;
    }

    struct Price {
        address basket;
        uint256 price;
    }

    // uses erc-20 transferFrom to transfer usd tokens from sender to this contract,
    // and basket tokens from this contract to the buyer.
    function buy(address token, uint256 amount) public {
        uint256 price = prices[token];
        require(price > 0, "no price for given token");
        uint256 reserve = amounts[token];
        if (reserve < amount)
            amount = reserve;

        IERC20(usdToken).transferFrom(msg.sender, address(this), price*amount);
        IERC20(token).transfer(msg.sender, amount);
    }

    /********************
       ADMIN functions
    *********************/

    function updatePrice(address basket, uint256 price) public onlyOwner {
        if (price == 0 ) delete prices[basket];
        else prices[basket] = price;

        emit PriceUpdate(basket, price);
    }

    function updatePrices(Price[] memory prices_) public onlyOwner {
        require(prices_.length < 255, "max prices length is 255");
        for (uint8 i=0; i < prices_.length; ++i){
            Price memory p = prices_[i];
            if (p.price == 0 ) delete prices[p.basket];
            else prices[p.basket] = p.price;

            emit PriceUpdate(p.basket, p.price);
        }
    }


    // withdraws to treasury:
    // @token: any erc-20 token
    function withdraw(address token, uint256 amount) public onlyOwner {
        require(
                IERC20(token).transfer(treasury, amount),
                "withdraw didn't succeed");
    }


    function toggleLock() public onlyOwner {
        locked = !locked;
    }


    modifier notLocked() {
        require(!locked, "contract is locked");
        _;
    }

    /**
     * @dev Emitted when `updatePrice` is called.
     *
     * Note that `price` may be zero. In that case the token is not available for purchase.
     */
    event PriceUpdate(address indexed token, uint256 price);
}
