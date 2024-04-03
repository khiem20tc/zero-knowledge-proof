//const {initialize} = require("zokrates-js");
//const BlockchainService = require("eth-blockchain-helper").default;

import { initialize } from "zokrates-js";
//import { BlockchainService } from "eth-blockchain-helper";

import pkg from "eth-blockchain-helper";
const BlockchainService = pkg.default;

async function main() {
  //initialize().then((zokratesProvider) => {

  const zokratesProvider = await initialize();

  // program is polynomial or boolean (===1/0)
  const source =
    "def main(public field a, public field b, public field c, private field x) -> field { return a*x*x + b*x - c; }";

  // compilation
  const artifacts = zokratesProvider.compile(source);

  // computation
  const { witness, output } = zokratesProvider.computeWitness(artifacts, [
    "29334470022014722733688883455732926443346109280118125",
    "29334470022014722733688883455732926443346109280118125",
    "29334470022014722733688883455732926443346109280118125",
    "29334470022014722733688883455732926443346109280118125",
  ]);
  console.log("witness, output", { witness, output });

  // run setup
  const keypair = zokratesProvider.setup(artifacts.program);
  console.log("keypair", keypair);

  // generate proof
  const proof = zokratesProvider.generateProof(
    artifacts.program,
    witness,
    keypair.pk
  );
  console.log("proof", proof);
  console.log("proof_a", proof.proof.a);
  console.log("proof_b", proof.proof.b);
  console.log("proof_c", proof.proof.c);

  // export solidity verifier
  const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);
  console.log("verifier", verifier);

  // VERIFY OFF-CHAIN
  const isVerified = zokratesProvider.verify(keypair.vk, proof);
  console.log("isVerified", isVerified);

  // VERIFY ON-CHAIN

  const RPC = "";
  const chainId = 4444;
  const SCA = "0x511D2D67EA7910182483C8Cf6e268730506a95BD";
  const gasBasePrice = 10000000000;
  const ABI = [
    {
      inputs: [
        {
          components: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "X",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "Y",
                  type: "uint256",
                },
              ],
              internalType: "struct Pairing.G1Point",
              name: "a",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "uint256[2]",
                  name: "X",
                  type: "uint256[2]",
                },
                {
                  internalType: "uint256[2]",
                  name: "Y",
                  type: "uint256[2]",
                },
              ],
              internalType: "struct Pairing.G2Point",
              name: "b",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "X",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "Y",
                  type: "uint256",
                },
              ],
              internalType: "struct Pairing.G1Point",
              name: "c",
              type: "tuple",
            },
          ],
          internalType: "struct Verifier.Proof",
          name: "proof",
          type: "tuple",
        },
        {
          internalType: "uint256[4]",
          name: "input",
          type: "uint256[4]",
        },
      ],
      name: "verifyTx",
      outputs: [
        {
          internalType: "bool",
          name: "r",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  console.log({ RPC, chainId, SCA, ABI, gasBasePrice });

  let instance = new BlockchainService(RPC, chainId, SCA, ABI, gasBasePrice);

  let _proof = proof.proof;
  let _inputs = proof.inputs;
  console.log({ _proof, _inputs });

  // create raw transaction
  const data = await instance.readFunc(
    "verifyTx",
    [
      [
        [
          "0x11d6495f349d36c485a0d6f1cd3330e574e082c81d7e62353c467c53724c16d6",
          "0x0ed2095f3df140a5124824b9a434c35a1971c05b7f6da5e12968311501e6d304",
        ],
        [
          [
            "0x0d8c99392baf2cac23078b2329d3a1e15f5385afb9dc91b7049736f430d4e605",
            "0x228e9b78b4b064a0828ce074999b681d126e03b12e76f3bcbc91935f5fd7b2ea",
          ],
          [
            "0x16a35b38bfb7164e1be00f60b610214f361cd0816f94e57ea07bf2414de417ca",
            "0x27a0c7f05efb6ebb8d58d7c53c7710ac6116094e1a1443673d7089dc5b71e35c",
          ],
        ],
        [
          "0x2acd7a6ab20e0bf8fea9a06218bfc263aa12d431911b259a0977b59cfabf7380",
          "0x127bb83dee237c15b3b424f93920d761d207c196a02e64cc7ceb6dc296ebd231",
        ],
      ],
      [
        "0x000000000000000000004e677579656e204875796e6820487575204b6869656d",
        "0x000000000000000000004e677579656e204875796e6820487575204b6869656d",
        "0x000000000000000000004e677579656e204875796e6820487575204b6869656d",
        "0x27c6362ef0a84aa9f712fca34027ebd524587d0412f281a8b4e7ee16c1d9ddf1",
      ],
    ],
    "0x560f8526C325d4C76DCf6F554F25e29Ad82C5a95",
    0
  );

  console.log("data", data);
}

main();
