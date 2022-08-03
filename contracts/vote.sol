// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Review {

    struct voting {
        address[] agree;
        address[] disagree;
        uint8 count;
    }

    struct review {
        string place;
        string title; 
        string content;
        address writer;
    }

    mapping(string => voting) public votings;
    mapping(string => review) public reviews;

    function add_voting(string memory _review_id, bool _a_d) public{
        if (_a_d){
            votings[_review_id].agree.push(msg.sender);
        }else{
            votings[_review_id].disagree.push(msg.sender);
        }
        votings[_review_id].count++;
    }
    function view_voting(string memory _review_id) public view returns (address[] memory, address[] memory, uint8){
        address[] memory Agree = votings[_review_id].agree;
        address[] memory Disagree = votings[_review_id].disagree;
        uint8 count = votings[_review_id].count;
        return ( Agree, Disagree, count);
    }

    function add_review(string memory _review_id, string memory _place, string memory _title, string memory _content, address _writer) public {
        reviews[_review_id].place = _place;
        reviews[_review_id].title = _title;
        reviews[_review_id].content = _content;
        reviews[_review_id].writer = _writer;
    }

    function view_review(string memory _review_id) public view returns (string memory, string memory, string memory, address){
        string memory place = reviews[_review_id].place;
        string memory title = reviews[_review_id].title;
        string memory content = reviews[_review_id].content;
        address writer = reviews[_review_id].writer;
        return ( place, title, content, writer );

    }
}

