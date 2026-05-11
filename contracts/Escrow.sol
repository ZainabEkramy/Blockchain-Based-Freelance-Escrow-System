// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {

    enum State { Draft, Funded, Published, Assigned, Completed }

    struct Project {
        address client;
        string title;
        string details;
        uint deadline;
        uint price;
        address freelancer;
        State state;
    }

    uint public projectCount;
    mapping(uint => Project) public projects;

    function createProject(
        string memory _title,
        string memory _details,
        uint _deadline,
        uint _price
    ) external {

        projectCount++;

        projects[projectCount] = Project({
            client: msg.sender,
            title: _title,
            details: _details,
            deadline: _deadline,
            price: _price,
            freelancer: address(0),
            state: State.Draft
        });
    }

    function deposit(uint _id) external payable {
        Project storage p = projects[_id];

        require(msg.sender == p.client, "Only client");
        require(p.state == State.Draft, "Must be Draft");
        require(msg.value >= p.price, "Not enough ETH");

        p.state = State.Funded;
    }

    function publish(uint _id) external {
        Project storage p = projects[_id];

        require(msg.sender == p.client, "Only client");
        require(p.state == State.Funded, "Not funded");

        p.state = State.Published;
    }

    function selectFreelancer(uint _id, address _freelancer) external {
        Project storage p = projects[_id];

        require(msg.sender == p.client, "Only client");
        require(p.state == State.Published, "Not published");

        p.freelancer = _freelancer;
        p.state = State.Assigned;
    }

    function release(uint _id) external {
        Project storage p = projects[_id];

        require(msg.sender == p.client, "Only client");
        require(p.state == State.Assigned, "Not assigned");

        p.state = State.Completed;

        (bool success, ) = payable(p.freelancer).call{value: p.price}("");
        require(success, "Transfer failed");
    }
}
