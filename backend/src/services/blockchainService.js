import crypto from 'crypto';

class BlockchainService {
  constructor() {
    this.blockchain = [];
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.difficulty = 2;
    
    // Create genesis block
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisBlock = {
      timestamp: Date.now(),
      transactions: [],
      previousHash: "0",
      hash: this.calculateHash(Date.now(), [], "0", 0),
      nonce: 0
    };
    this.blockchain.push(genesisBlock);
  }

  getLatestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  calculateHash(timestamp, transactions, previousHash, nonce) {
    return crypto
      .createHash('sha256')
      .update(timestamp + JSON.stringify(transactions) + previousHash + nonce)
      .digest('hex');
  }

  mineBlock(transactions) {
    const block = {
      timestamp: Date.now(),
      transactions: transactions,
      previousHash: this.getLatestBlock().hash,
      nonce: 0
    };

    // Proof of work
    while (block.hash?.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0")) {
      block.nonce++;
      block.hash = this.calculateHash(block.timestamp, block.transactions, block.previousHash, block.nonce);
    }

    console.log(`Block mined: ${block.hash}`);
    return block;
  }

  addDocumentToBlockchain(documentData) {
    const transaction = {
      type: 'DOCUMENT_UPLOAD',
      documentId: documentData.id,
      documentHash: documentData.hash,
      issuerId: documentData.issuerId,
      individualId: documentData.individualId,
      timestamp: Date.now(),
      metadata: {
        originalName: documentData.originalName,
        documentType: documentData.documentType,
        fileSize: documentData.fileSize
      }
    };

    this.pendingTransactions.push(transaction);
    
    // Mine block with pending transactions
    const block = this.mineBlock([...this.pendingTransactions]);
    this.blockchain.push(block);
    this.pendingTransactions = [];

    return {
      blockHash: block.hash,
      blockIndex: this.blockchain.length - 1,
      transactionId: crypto.randomBytes(16).toString('hex')
    };
  }

  addVerificationToBlockchain(verificationData) {
    const transaction = {
      type: 'DOCUMENT_VERIFICATION',
      documentId: verificationData.documentId,
      verifierId: verificationData.verifierId,
      isAuthentic: verificationData.isAuthentic,
      confidence: verificationData.confidence,
      timestamp: Date.now(),
      verificationHash: crypto
        .createHash('sha256')
        .update(JSON.stringify(verificationData))
        .digest('hex')
    };

    this.pendingTransactions.push(transaction);
    
    const block = this.mineBlock([...this.pendingTransactions]);
    this.blockchain.push(block);
    this.pendingTransactions = [];

    return {
      blockHash: block.hash,
      blockIndex: this.blockchain.length - 1,
      verificationHash: transaction.verificationHash
    };
  }

  verifyDocumentOnBlockchain(documentHash) {
    for (let i = 1; i < this.blockchain.length; i++) {
      const block = this.blockchain[i];
      for (let transaction of block.transactions) {
        if (transaction.type === 'DOCUMENT_UPLOAD' && transaction.documentHash === documentHash) {
          return {
            found: true,
            blockHash: block.hash,
            blockIndex: i,
            timestamp: transaction.timestamp,
            issuerId: transaction.issuerId,
            metadata: transaction.metadata
          };
        }
      }
    }
    return { found: false };
  }

  getVerificationHistory(documentId) {
    const verifications = [];
    
    for (let i = 1; i < this.blockchain.length; i++) {
      const block = this.blockchain[i];
      for (let transaction of block.transactions) {
        if (transaction.type === 'DOCUMENT_VERIFICATION' && transaction.documentId === documentId) {
          verifications.push({
            blockHash: block.hash,
            verifierId: transaction.verifierId,
            isAuthentic: transaction.isAuthentic,
            confidence: transaction.confidence,
            timestamp: transaction.timestamp,
            verificationHash: transaction.verificationHash
          });
        }
      }
    }
    
    return verifications;
  }

  validateBlockchain() {
    for (let i = 1; i < this.blockchain.length; i++) {
      const currentBlock = this.blockchain[i];
      const previousBlock = this.blockchain[i - 1];

      // Validate current block hash
      const validHash = this.calculateHash(
        currentBlock.timestamp,
        currentBlock.transactions,
        currentBlock.previousHash,
        currentBlock.nonce
      );

      if (currentBlock.hash !== validHash) {
        return { valid: false, error: `Invalid hash at block ${i}` };
      }

      // Validate chain linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        return { valid: false, error: `Invalid previous hash at block ${i}` };
      }
    }

    return { valid: true };
  }

  getBlockchainStats() {
    const totalBlocks = this.blockchain.length;
    const totalTransactions = this.blockchain.reduce((sum, block) => sum + block.transactions.length, 0);
    const documentUploads = this.blockchain.reduce((sum, block) => {
      return sum + block.transactions.filter(tx => tx.type === 'DOCUMENT_UPLOAD').length;
    }, 0);
    const verifications = this.blockchain.reduce((sum, block) => {
      return sum + block.transactions.filter(tx => tx.type === 'DOCUMENT_VERIFICATION').length;
    }, 0);

    return {
      totalBlocks,
      totalTransactions,
      documentUploads,
      verifications,
      chainValid: this.validateBlockchain().valid
    };
  }
}

export default new BlockchainService();