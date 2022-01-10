import elon from "../assets/elon.jpeg";
import cz from "../assets/cz.jpg";
import saylor from "../assets/saylor.jpeg";

const getCharacterImage = (characterName) => {
  switch (characterName) {
    case "Elon":
      return elon;
    case "CZ":
      return cz;
    case "Saylor":
      return saylor;
    default:
      break;
  }
};

export default getCharacterImage;
