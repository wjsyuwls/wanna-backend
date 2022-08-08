// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract token {
    address Owner;

    struct token_info {
        string symbol;
        uint256 totalsupply;
    }

    mapping(string => token_info) public token_list;
    mapping(address => uint256) public amount;

    constructor() {
        Owner = msg.sender;
    }

    function createToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalsupply
    ) public {
        require(Owner == msg.sender);
        token_list[_name].symbol = _symbol;
        token_list[_name].totalsupply = _totalsupply;
        amount[Owner] = _totalsupply;
    }

    function transfer(address _to, uint256 _amount) public {
        require(Owner == msg.sender);
        require(amount[Owner] >= _amount);
        amount[Owner] -= _amount;
        amount[_to] += _amount;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public {
        require(Owner == msg.sender);
        require(amount[_from] >= _amount);
        amount[_from] -= _amount;
        amount[_to] += _amount;
    }

    function transferFromMulti(
        address _from,
        address[] memory _to,
        uint256 _amount
    ) public {
        require(Owner == msg.sender);
        require(amount[_from] >= _amount);

        for (uint256 i = 0; i < _to.length; i++) {
            amount[_from] -= _amount;
            amount[_to[i]] += _amount;
        }
    }

    function balance(address _wallet) public view returns (uint256) {
        return (amount[_wallet]);
    }

    function tokenInfo(string memory _name)
        public
        view
        returns (string memory, uint256)
    {
        return (token_list[_name].symbol, token_list[_name].totalsupply);
    }
}
