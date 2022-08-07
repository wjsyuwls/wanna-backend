// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Review {
    struct voting {
        address[] agree;
        address[] disagree;
        uint8 count;
    }

    struct review {
        address writer;
        string place;
        string title;
        string content;
        string img;
        uint256 score;
    }

    mapping(uint256 => voting) public votings;
    mapping(string => uint256[]) public place_reviews;
    mapping(uint256 => review) public reviews;

    function add_voting(
        uint256 _review_id,
        bool _a_d,
        address _voter
    ) public {
        if (_a_d) {
            votings[_review_id].agree.push(_voter);
        } else {
            votings[_review_id].disagree.push(_voter);
        }
        votings[_review_id].count++;
    }

    function view_voting(uint256 _review_id)
        public
        view
        returns (
            address[] memory,
            address[] memory,
            uint8
        )
    {
        address[] memory Agree = votings[_review_id].agree;
        address[] memory Disagree = votings[_review_id].disagree;
        uint8 count = votings[_review_id].count;
        return (Agree, Disagree, count);
    }

    function add_place_review(string memory _place, uint256 _review_id) public {
        place_reviews[_place].push(_review_id);
    }

    function add_review(
        uint256 _review_id,
        address _writer,
        string memory _place,
        string memory _title,
        string memory _content,
        string memory _img,
        uint256 _score
    ) public {
        reviews[_review_id].writer = _writer;
        reviews[_review_id].place = _place;
        reviews[_review_id].title = _title;
        reviews[_review_id].content = _content;
        reviews[_review_id].img = _img;
        reviews[_review_id].score = _score;
        add_place_review(_place, _review_id);
    }

    function view_place_review(string memory _place)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory place_review = place_reviews[_place];
        return place_review;
    }

    function view_review(uint256 _review_id)
        public
        view
        returns (
            address,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        address writer = reviews[_review_id].writer;
        string memory place = reviews[_review_id].place;
        string memory title = reviews[_review_id].title;
        string memory content = reviews[_review_id].content;
        string memory img = reviews[_review_id].img;
        uint256 score = reviews[_review_id].score;
        return (writer, place, title, content, img, score);
    }
}
