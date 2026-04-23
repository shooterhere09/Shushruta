const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, data, previousBlockHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousBlockHash = previousBlockHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(this.index + this.previousBlockHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined: ' + this.hash);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Adjust this to control mining difficulty
    }

    createGenesisBlock() {
        return new Block(0, new Date().toISOString(), 'Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousBlockHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousBlockHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

class BlockchainManager {
    constructor() {
        this.chains = {}; // Stores blockchain instances, keyed by category
    }

    getChain(category) {
        if (!this.chains[category]) {
            this.chains[category] = new Blockchain();
            console.log(`New blockchain created for category: ${category}`);
        }
        return this.chains[category];
    }

    addBlockToCategory(category, data) {
        const chain = this.getChain(category);
        const newBlock = new Block(chain.chain.length, new Date().toISOString(), data);
        chain.addBlock(newBlock);
        console.log(`Block added to ${category} blockchain:`, newBlock);
        console.log(`${category} blockchain valid?`, chain.isChainValid());
    }

    isCategoryChainValid(category) {
        const chain = this.chains[category];
        if (chain) {
            return chain.isChainValid();
        }
        return false; // Or throw an error if chain doesn't exist
    }
}

module.exports = { Block, Blockchain, BlockchainManager };