// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol"
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract ERC4338 is ERC721URIStorage, ERC20, Ownable {
    event ContentApproved(bytes32 indexed contentHash, bool approved);
    event RewardsDistributed(bytes32 indexed contentHash, address indexed validator, uint256 amount);
    struct Vote {
        bool hasVoted;
        bool approved;
    }

    struct Content {
        bytes32 contentHash;
        uint256 yesVotes;
        uint256 noVotes;
        bool finalized;
        mapping(uint256 => Vote) votes;
    }

    mapping(bytes32 => Content) public contents;
    mapping(bytes32 => mapping(address => bool)) public rewarded;

    constructor() ERC721("VoteToken", "VTK") ERC20("RewardToken", "RTK") Ownable(msg.sender) {}

    // Override _mint functions to handle both ERC721 and ERC20 tokens
    function _mintERC20(address to, uint256 amount) internal virtual {
        ERC20._mint(to, amount);
    }

    function _mintERC721(address to, uint256 tokenId) internal virtual {
        ERC721._mint(to, tokenId);
    }

    // Mint a VoteToken for a validator
    function mintVoteToken(address validator, uint256 tokenId, string calldata metadataURI) external onlyOwner {
        _mintERC721(validator, tokenId);
        _setTokenURI(tokenId, metadataURI);
    }

    // Cast a vote
    function castVote(uint256 voteTokenId, bytes32 contentHash, bool approve) external {
        require(ownerOf(voteTokenId) == msg.sender, "Not the owner of VoteToken");
        Content storage content = contents[contentHash];
        require(!content.votes[voteTokenId].hasVoted, "Already voted");
        require(!content.finalized, "Voting finalized");

        content.votes[voteTokenId] = Vote(true, approve);
        if (approve) {
            content.yesVotes++;
        } else {
            content.noVotes++;
        }

        emit VoteCasted(voteTokenId, contentHash, approve);
    }

    // Tally votes and finalize
    function tallyVotes(bytes32 contentHash) external returns (bool approved) {
        Content storage content = contents[contentHash];
        require(!content.finalized, "Already finalized");
        content.finalized = true;
        approved = content.yesVotes > content.noVotes;
        emit ContentApproved(contentHash, approved);
        return approved;
    }

    // Distribute rewards
    function distributeRewards(bytes32 contentHash, address[] calldata validators, uint256[] calldata amounts) external onlyOwner {
        require(contents[contentHash].finalized, "Voting not finalized");
        require(validators.length == amounts.length, "Array length mismatch");

        for (uint256 i = 0; i < validators.length; i++) {
            require(!rewarded[contentHash][validators[i]], "Already rewarded");
            rewarded[contentHash][validators[i]] = true;
            _mintERC20(validators[i], amounts[i]);
            emit RewardsDistributed(contentHash, validators[i], amounts[i]);
        }
    }

    // Get vote details
    function getVoteDetails(bytes32 contentHash, uint256 voteTokenId) external view returns (bool voted, bool approved) {
        Vote storage vote = contents[contentHash].votes[voteTokenId];
        return (vote.hasVoted, vote.approved);
    }
}