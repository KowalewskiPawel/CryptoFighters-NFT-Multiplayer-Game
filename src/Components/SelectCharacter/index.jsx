import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../../consts";
import transformCharacterData from "../../utils/transformCharacterData";
import getCharacterImage from "../../utils/getCharacterImage";
import cryptoFighters from "../../abi/cryptoFighters.json";
import LoadingIndicator from "../LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        setMintingCharacter(false);
      }
    } catch (error) {
      console.warn("MintCharacterAction Error:", error);
      setMintingCharacter(false);
    }
  };

  const renderCharacters = () =>
    characters.map((character, index) => (
      <div className='character-item' key={character.name}>
        <div className='name-container'>
          <p>{character.name}</p>
        </div>
        <img src={getCharacterImage(character.name)} alt={character.name} />
        <button
          type='button'
          className='character-mint-button'
          onClick={mintCharacterNFTAction(
            index
          )}>{`Mint ${character.name}`}</button>
      </div>
    ));

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        cryptoFighters.abi,
        signer
      );
      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        const characters = charactersTxn.map(transformCharacterData);
        setCharacters(characters);
      } catch (error) {
        console.error("Something went wrong fetching characters:", error);
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };

    if (gameContract) {
      getCharacters();
      gameContract.on("CharacterNFTMinted", onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
  }, [gameContract]);

  return (
    <div className='select-character-container'>
      <h2>Mint Your Hero. Choose wisely.</h2>
      {characters.length > 0 && (
        <div className='character-grid'>{renderCharacters()}</div>
      )}
      {mintingCharacter && (
        <div className='loading'>
          <div className='indicator'>
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectCharacter;
