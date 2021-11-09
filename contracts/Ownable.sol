// SPDX-License-Identifier:  Apache-2.0

pragma solidity ^0.8.4;

contract Ownable {

    address public owner;

    constructor(address owner_) {
        owner = owner_;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "not an owner");
        _;
    }

    function updatOwner(address newOwner) public onlyOwner {
        owner = newOwner;
        emit OwnerUpdate(newOwner);
    }

    /**
     * @dev Emitted when `owner` is updated.
     */
    event OwnerUpdate(address owner);

}
