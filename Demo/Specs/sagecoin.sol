// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SGUSD (Sagecoin)
 * @dev An interest-bearing stablecoin that rebases every second.
 * 1 SGUSD = 1 USD + Accrued Interest.
 */
contract Sagecoin is IERC20, IERC20Metadata, Ownable {
    string private _name;
    string private _symbol;
    
    // We store shares, not balances. 
    // balance = shares * (total_supply / total_shares)
    mapping(address => uint256) private _shares;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalShares;
    
    // Interest Rate: 500 = 5% APY (represented in basis points)
    uint256 public annualInterestRate = 500; 
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_IN_YEAR = 31536000;

    // The timestamp when the contract was deployed or interest was last set
    uint256 public lastUpdateTimestamp;
    
    // The multiplier starts at 1 (using 18 decimals for precision)
    uint256 private constant PRECISION = 1e18;
    uint256 public baseMultiplier = 1e18;

    constructor(string memory name_, string memory symbol_) Ownable(msg.sender) {
        _name = name_;
        _symbol = symbol_;
        lastUpdateTimestamp = block.timestamp;
    }

    /**
     * @dev Calculates the current multiplier based on time elapsed.
     * This is what makes the balance "tick" up in real-time.
     */
    function getCurrentMultiplier() public view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastUpdateTimestamp;
        // Simple linear interest: base * (1 + (rate * time) / year)
        uint256 interestAccrued = (baseMultiplier * annualInterestRate * timeElapsed) / (BASIS_POINTS * SECONDS_IN_YEAR);
        return baseMultiplier + interestAccrued;
    }

    function totalSupply() public view override returns (uint256) {
        if (_totalShares == 0) return 0;
        return (_totalShares * getCurrentMultiplier()) / PRECISION;
    }

    function balanceOf(address account) public view override returns (uint256) {
        if (_totalShares == 0) return 0;
        return (_shares[account] * getCurrentMultiplier()) / PRECISION;
    }

    /**
     * @dev Minting SGUSD. 
     * In the demo, Acme Inc. calls this to "Deposit USD".
     */
    function mint(address to, uint256 amount) external onlyOwner {
        uint256 currentMultiplier = getCurrentMultiplier();
        uint256 sharesToMint = (amount * PRECISION) / currentMultiplier;

        _totalShares += sharesToMint;
        _shares[to] += sharesToMint;

        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Burning SGUSD. 
     * Used when the Supplier "Cashes Out" to their local bank.
     */
    function burn(address from, uint256 amount) external onlyOwner {
        uint256 currentMultiplier = getCurrentMultiplier();
        uint256 sharesToBurn = (amount * PRECISION) / currentMultiplier;

        require(_shares[from] >= sharesToBurn, "ERC20: burn amount exceeds balance");

        _totalShares -= sharesToBurn;
        _shares[from] -= sharesToBurn;

        emit Transfer(from, address(0), amount);
    }

    // Standard ERC20 logic modified for shares
    function transfer(address to, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        uint256 currentMultiplier = getCurrentMultiplier();
        uint256 sharesToTransfer = (amount * PRECISION) / currentMultiplier;

        require(_shares[from] >= sharesToTransfer, "ERC20: transfer amount exceeds balance");

        _shares[from] -= sharesToTransfer;
        _shares[to] += sharesToTransfer;

        emit Transfer(from, to, amount);
    }

    // Boilerplate ERC20 Metadata
    function name() public view override returns (string memory) { return _name; }
    function symbol() public view override returns (string memory) { return _symbol; }
    function decimals() public view override returns (uint8) { return 18; }
    
    function allowance(address owner, address spender) public view override returns (uint256) { return _allowances[owner][spender]; }
    function approve(address spender, uint256 amount) public override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        _allowances[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }
}