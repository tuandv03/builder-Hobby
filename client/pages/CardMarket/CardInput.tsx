import { useState, useEffect } from "react";

const codePath = 'MP25-EN';
const cards = [
{ code: "001", name:	"Yubel - The Loving Defender Forever"},
{ code: "002", name:	"Goblin Biker Big Gabonga"},
{ code: "003", name:	"Ancient Gear Dark Golem"},
{ code: "004", name:	"Nightmare Apprentice"},
{ code: "005", name:	"Shining Sarcophagus"},
{ code: "006", name: "Spell Card \"Monster Reborn\""},
{ code: "007", name:	"Spell Card \"Soul Exchange\""},
{ code: "008", name:	"The Unstoppable Exodia Incarnate"},
{ code: "009", name:	"Light and Darkness Dragonlord"},
{ code: "010", name:	"Mementomictlan Tecuhtlica - Creation King"},
{ code: "011", name:	"Millennium Ankh"},
{ code: "012", name:	"Surfacing Big Jaws"},
{ code: "013", name:	"Heart of the Blue-Eyes"},
{ code: "014", name:	"Red-Eyes Black Fullmetal Dragon"},
{ code: "015", name:	"Raigeki"},
{ code: "016", name:	"Harpie's Feather Duster"},
{ code: "017", name:	"Pot of Greed"},
{ code: "018", name:	"Bottomless Trap Hole"},
{ code: "019", name:	"Chaos Sorcerer"},
{ code: "020", name:	"D.D. Designator"},
{ code: "021", name:	"Miracle Fusion"},
{ code: "022", name:	"Starlight Road"},
{ code: "023", name:	"Beelze of the Diabolic Dragons"},
{ code: "024", name:	"The Monarchs Stormforth"},
{ code: "025", name:	"Tenacity of the Monarchs"},
{ code: "026", name:	"Domain of the True Monarchs"},
{ code: "027", name:	"Retaliating \"C\""},
{ code: "028", name:	"Gameciel, the Sea Turtle Kaiju"},
{ code: "029", name:	"Obliterate!!!"},
{ code: "030", name:	"Topologic Bomber Dragon"},
{ code: "031", name:	"Red-Eyes Slash Dragon"},
{ code: "032", name:	"Infinite Impermanence"},
{ code: "033", name:	"Number 90: Galaxy-Eyes Photon Lord"},
{ code: "034", name:	"Starliege Photon Blast Dragon"},
{ code: "035", name:	"Chaos Dragon Levianeer"},
{ code: "036", name:	"Dark Armed, the Dragon of Annihilation"},
{ code: "037", name:	"Red Rose Dragon"},
{ code: "038", name:	"White Rose Dragon"},
{ code: "039", name:	"Duel Link Dragon, the Duel Dragon"},
{ code: "040", name:	"Borrelcode Dragon"},
{ code: "041", name:	"True Light"},
{ code: "042", name:	"Blue-Eyes Tyrant Dragon"},
{ code: "043", name:	"Bystial Magnamhut"},
{ code: "044", name:	"Bystial Druiswurm"},
{ code: "045", name:	"Bystial Baldrake"},
{ code: "046", name:	"Rescue-ACE Hydrant"},
{ code: "047", name:	"S:P Little Knight"},
{ code: "048", name:	"Legendary Fire King Ponix"},
{ code: "049", name:	"Spirit with Eyes of Blue"},
{ code: "050", name:	"Temple of the Kings"},
{ code: "051", name:	"Goblin Biker Dugg Charger"},
{ code: "052", name:	"Lo, the Prayers of the Voiceless Voice"},
{ code: "053", name:	"Saffira, Dragon Queen of the Voiceless Voice"},
{ code: "054", name:	"EM:P Meowmine"},
{ code: "055", name:	"Skull Guardian, Protector of the Voiceless Voice"},
{ code: "056", name:	"Goblin Biker Grand Entrance"},
{ code: "057", name:	"The Black Goat Laughs"},
{ code: "058", name:	"Iron Thunder"},
{ code: "059", name:	"Silent Swordsman Zero"},
{ code: "060", name:	"Silent Magician Zero"},
{ code: "061", name:	"Gadget Trio"},
{ code: "062", name:	"Snake-Eyes Diabellstar"},
{ code: "063", name:	"Diabellze the Original Sinkeeper"},
{ code: "064", name:	"Tenpai Dragon Paidra"},
{ code: "065", name:	"Gruesome Grave Squirmer"},
{ code: "066", name:	"Lightsworn Dragonling"},
{ code: "067", name:	"Mementotlan Twin Dragon"},
{ code: "068", name:	"Centur-Ion Auxila"},
{ code: "069", name:	"Minerva, the Athenian Lightsworn"},
{ code: "070", name:	"Varudras, the Final Bringer of the End Times"},
{ code: "071", name:	"Ties That Bind"},
{ code: "072", name:	"Nightmare Throne"},
{ code: "073", name:	"Mementotlan Fusion"},
{ code: "074", name:	"Wake Up Centur-Ion!"},
{ code: "075", name:	"Metaltronus"},
{ code: "076", name:	"Simultaneous Equation Cannons"},
{ code: "077", name:	"Sengenjin Wakes from a Millennium"},
{ code: "078", name:	"Shield of the Millennium Dynasty"},
{ code: "079", name:	"Astellar of the White Forest"},
{ code: "080", name:	"Elzette of the White Forest"},
{ code: "081", name:	"Fiendsmith Engraver"},
{ code: "082", name:	"Tenpai Dragon Genroku"},
{ code: "083", name:	"Mementotlan Shleepy"},
{ code: "084", name:	"Disablaster the Negation Fortress"},
{ code: "085", name:	"Mulcharmy Purulia"},
{ code: "086", name:	"Silvera, Wolf Tamer of the White Forest"},
{ code: "087", name:	"Rciela, Sinister Soul of the White Forest"},
{ code: "088", name:	"Heretical Phobos Covos"},
{ code: "089", name:	"Fiendsmith's Requiem"},
{ code: "090", name:	"Silhouhatte Rabbit"},
{ code: "091", name:	"Wedju Temple"},
{ code: "092", name:	"Tales of the White Forest"},
{ code: "093", name:	"Fiendsmith's Tract"},
{ code: "094", name:	"Exxod Fires of Rage"},
{ code: "095", name:	"Dominus Purge"},
{ code: "096", name:	"Mimighoul Master"},
{ code: "097", name:	"Mimighoul Dungeon"},
{ code: "098", name:	"Goblin Bikers Gone Wild"},
{ code: "099", name:	"Primite Imperial Dragon"},
{ code: "100", name:	"Lacrima the Crimson Tears"},
{ code: "101", name:	"Mermail Shadow Squad"},
{ code: "102", name:	"Mulcharmy Fuwalos"},
{ code: "103", name:	"Azamina Ilia Silvia"},
{ code: "104", name:	"Azamina Mu Rcielago"},
{ code: "105", name:	"Azamina Moa Regina"},
{ code: "106", name:	"Centur-Ion Primera Primus"},
{ code: "107", name:	"Legendary Lord Six Samurai - Shi En"},
{ code: "108", name:	"Poseidra Abyss, the Atlantean Dragon Lord"},
{ code: "109", name:	"Fiendsmith's Agnumday"},
{ code: "110", name:	"Flying Mary, the Wandering Ghost Ship"},
{ code: "111", name:	"Incoming Machine!"},
{ code: "112", name:	"The Hallowed Azamina"},
{ code: "113", name:	"Deception of the Sinful Spoils"},
{ code: "114", name:	"Primite Lordly Lode"},
{ code: "115", name:	"Primite Drillbeam"},
{ code: "116", name:	"Dominus Impulse"},
{ code: "117", name:	"Mimighoul Throne"},
{ code: "118", name:	"Sword Ryzeal"},
{ code: "119", name:	"Ice Ryzeal"},
{ code: "120", name:	"Ext Ryzeal"},
{ code: "121", name:	"Ryzeal Detonator"},
{ code: "122", name:	"Maliss P White Rabbit"},
{ code: "123", name:	"Maliss P Chessy Cat"},
{ code: "124", name:	"Maliss P Dormouse"},
{ code: "125", name:	"Maliss Q Red Ransom"},
{ code: "126", name:	"Maliss Q White Binder"},
{ code: "127", name:	"Maliss in Underground"},
{ code: "128", name:	"Maliss C GWC-06"},
{ code: "129", name:	"Maliss C TB-11"},
{ code: "130", name:	"Dark Hole"},
{ code: "131", name:	"Spell Canceller"},
{ code: "132", name:	"Black Garden"},
{ code: "133", name:	"Number 11: Big Eye"},
{ code: "134", name:	"Vulcan the Divine"},
{ code: "135", name:	"Mecha Phantom Beast Dracossack"},
{ code: "136", name:	"Denko Sekka"},
{ code: "137", name:	"Paleozoic Anomalocaris"},
{ code: "138", name:	"Paleozoic Opabinia"},
{ code: "139", name:	"Dragonic Diagram"},
{ code: "140", name:	"Danger! Bigfoot!"},
{ code: "141", name:	"Danger! Nessie!"},
{ code: "142", name:	"Linguriboh"},
{ code: "143", name:	"Traptantalizing Tune"},
{ code: "144", name:	"Salamangreat of Fire"},
{ code: "145", name:	"Mementotlan Dark Blade"},
{ code: "146", name:	"Blaze, Supreme Ruler of all Dragons"},
{ code: "147", name:	"Queen of the Blazing Domain"},
{ code: "148", name:	"Dragon Gate"},
{ code: "149", name:	"Bot Herder"},
{ code: "150", name:	"Chaos Ruler, the Chaotic Magical Dragon"},

];

export default function CardInput() {
  const [dbCards, setDbCards] = useState<{ code: string; name: string; quantity: number }[]>([]);
  const [cardCode, setCardCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  // Đọc danh sách từ Google Sheet qua API backend
  useEffect(() => {
    fetch("/api/cards")
      .then(res => res.json())
      .then(data => setDbCards(data))
      .catch(() => setDbCards([]));
  }, []);

  const handleAddCard = async () => {
    const found = cards.find(card => card.code === cardCode.trim());
    if (!found) {
      setError("Mã card không hợp lệ hoặc không tồn tại!");
      return;
    }
    setError("");
    setCardCode("");
    setQuantity(1);

    // Gửi lên backend để ghi vào Google Sheet
    await fetch("/api/cards/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: found.code, name: found.name, quantity }),
    });

    // Đọc lại danh sách sau khi ghi
    fetch("/api/cards")
      .then(res => res.json())
      .then(data => setDbCards(data))
      .catch(() => setDbCards([]));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Database Card (Google Sheet)</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={cardCode}
          onChange={e => setCardCode(e.target.value)}
          placeholder="Nhập mã card (ví dụ: 001)"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          placeholder="Số lượng"
          className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={handleAddCard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Add Card
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Mã</th>
            <th className="border px-2 py-1 text-left">Tên</th>
            <th className="border px-2 py-1 text-left">Số lượng</th>
          </tr>
        </thead>
        <tbody>
          {dbCards.map(card => (
            <tr key={card.code}>
              <td className="border px-2 py-1">{codePath + " " + card.code}</td>
              <td className="border px-2 py-1">{card.name}</td>
              <td className="border px-2 py-1">{card.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}