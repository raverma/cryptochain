const Blockchain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('./crypto-hash');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain ;

    beforeEach(()=>{
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
    });
    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts witha genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('add a new block to the chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({ data: newData});

        expect(blockchain.chain[blockchain.chain.length -1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        beforeEach(()=>{
            blockchain.addBlock({data: 'Bears'});
            blockchain.addBlock({data: 'Beets'});
            blockchain.addBlock({data: 'Battlestar Galactica'});
        })
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with a genesis block and has multiple blocks', () => {
            describe('and the lasthash has been changed', ()=> {
         
                it('return false', () =>{
                    blockchain.chain[2].lastHash = 'broken-lasthash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and the chain  contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[1].data = 'evil-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with a jumped difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                    const badBlock = new Block({timestamp, lastHash,hash, nonce, difficulty, data });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);                    
                });
            });
            describe('and the chain does not contain any invalid blocks', () => {
                it('returns true', ()=> {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });

        
    });

    describe('replaceChain()', () => {
        describe('when the new chain is not longer',() => {
            it('does not replace the chain', () => {
                newChain.chain[0] = {new: 'chain'};
                blockchain.replaceChain(newChain.chain);
                expect(blockchain.chain).toEqual(originalChain);
            });
        } );

        describe('when the new chain is longer', () => {
            beforeEach(()=> {
                newChain.addBlock({data: 'Bears'});
                newChain.addBlock({data: 'Beets'});
                newChain.addBlock({data: 'Battlestar Galactica'});
            });
            describe('and the chain is invalid', ()=> {
                it('does not replace the chain', () => {
                    newChain.chain[2].hash = 'some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(originalChain);
                });
            });

            describe('and the chain is valid', () => {
                it('replaces the chain', () => {
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(newChain.chain);
                });
            });
        });
    });

});