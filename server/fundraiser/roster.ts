/**
 * Players in the fundraiser — the Fall 2026 Morehouse Baseball roster (team form responses,
 * received 2026-11-21). Only name, position and class are used; photos are the existing
 * headshots from morehouseathletics.com where we have one ('' = initials).
 * Each name gets its own invite page on startup. To add a player, add them here (or on the admin page).
 * To drop one, remove them here AND delete them on the admin page (otherwise they stay in the database).
 * `was`: the player's previous name on the site — renames their existing page instead of adding a new one.
 */
export interface RosterPlayer {
  name: string;
  number: string;
  position: string;
  year: string;
  photo: string; // headshot on morehouseathletics.com, '' when none
  was?: string;
}

export const FUNDRAISER_ROSTER: RosterPlayer[] = [
  { name: "Alec Waller", number: "", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Waller__Alec_Vwk6n.JPG?width=400&quality=90" },
  { name: "Andwele Pittman", number: "", position: "3B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Pittman__Andwele_OJovn.JPG?width=400&quality=90" },
  { name: "Antione Hollaway", number: "", position: "RHP", year: "So.", photo: "https://morehouseathletics.com/images/2026/4/11/IMG_9097.JPG?width=400&quality=90", was: "Antoine Holloway" },
  { name: "Bradley Selma", number: "", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Selma__Bradley_1ruwM.JPG?width=400&quality=90" },
  { name: "Braeden Lampkin", number: "", position: "MIF", year: "Fr.", photo: "" },
  { name: "Brian Grant Jr.", number: "", position: "1B", year: "Fr.", photo: "" },
  { name: "Brian Moore", number: "", position: "1B", year: "Fr.", photo: "" },
  { name: "Brycen Norman-Jimill", number: "", position: "MIF", year: "Fr.", photo: "" },
  { name: "Caleb Harley", number: "", position: "2B", year: "So.", photo: "https://morehouseathletics.com/images/2026/4/11/IMG_9088.JPG?width=400&quality=90" },
  { name: "Calvin Butts", number: "", position: "OF", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Butts__Cam_oR2tG.JPG?width=400&quality=90" },
  { name: "Chase Williams", number: "", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Williams__fiq5s.JPG?width=400&quality=90" },
  { name: "Chi Smith", number: "", position: "3B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Smith__Chi_06j57.JPG?width=400&quality=90" },
  { name: "Connor Eberhart", number: "", position: "LHP", year: "Fr.", photo: "" },
  { name: "Dejorryn Pettis", number: "", position: "RHP", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Pettis__Dejorryn_54gAH.JPG?width=400&quality=90" },
  { name: "Denver Matthews", number: "", position: "OF", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Matthews__Denver_7GauW.JPG?width=400&quality=90" },
  { name: "Drew Rhoden", number: "", position: "SS", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Rhoden__Drew_UWib3.JPG?width=400&quality=90" },
  { name: "Dylan Arnold", number: "", position: "MIF", year: "Fr.", photo: "" },
  { name: "Dylan Davis", number: "", position: "C", year: "Fr.", photo: "" },
  { name: "Dylan McCalmon", number: "", position: "OF", year: "Fr.", photo: "" },
  { name: "Ethan Hayes", number: "", position: "RHP", year: "Fr.", photo: "" },
  { name: "Evan Talton", number: "", position: "OF", year: "Fr.", photo: "" },
  { name: "Gavin Aiken", number: "", position: "OF", year: "Fr.", photo: "" },
  { name: "Harry Gibson", number: "", position: "OF", year: "Fr.", photo: "" },
  { name: "Holden Wimberly-Lane", number: "", position: "RHP", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Lane__Holden_cAPLR.JPG?width=400&quality=90", was: "Holden Lane" },
  { name: "Ian Makle", number: "", position: "LHP", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Makle__Ian_qnVpx.JPG?width=400&quality=90" },
  { name: "Jace Binion", number: "", position: "RHP", year: "Fr.", photo: "" },
  { name: "Jackson Davis", number: "", position: "MIF", year: "So.", photo: "" },
  { name: "Jackson Edington", number: "", position: "RHP", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Edington__Jackson_RKVVw.JPG?width=400&quality=90" },
  { name: "Jacob Haynes", number: "", position: "RHP", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Haynes__LtEdg.JPG?width=400&quality=90" },
  { name: "Jaiden Spencer", number: "", position: "SS", year: "So.", photo: "" },
  { name: "Jalen Brogdon", number: "", position: "3B", year: "So.", photo: "" },
  { name: "James Wyllie", number: "", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Wyllie__QD9nM.JPG?width=400&quality=90" },
  { name: "Jaxson Brown", number: "", position: "OF", year: "Fr.", photo: "" },
  { name: "Jerry Dixon", number: "", position: "OF", year: "Fr.", photo: "" },
  { name: "John Harris", number: "", position: "1B", year: "Fr.", photo: "" },
  { name: "Jordan Bibbs-Walker", number: "", position: "MIF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Bibbs__-Walker__Jordan_6tWp5.JPG?width=400&quality=90" },
  { name: "Joseph Richburg", number: "", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Richburg__Joseph_q5z8b.JPG?width=400&quality=90" },
  { name: "Josiah Smith", number: "", position: "3B", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Smith__Josiah_uGlDC.JPG?width=400&quality=90" },
  { name: "Julian Goodman", number: "", position: "RHP", year: "Jr.", photo: "" },
  { name: "Kaleb McClee", number: "", position: "3B", year: "Fr.", photo: "" },
  { name: "Keith Minor", number: "", position: "RHP", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Minor__TGQLu.JPG?width=400&quality=90" },
  { name: "Kendal Sellers", number: "", position: "MIF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Sellers__Kendall_3QYRq.JPG?width=400&quality=90" },
  { name: "Kendyn Fredieu", number: "", position: "OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Fredieu__Kendyn_bRcpL.JPG?width=400&quality=90" },
  { name: "Malone Smith", number: "", position: "2B", year: "So.", photo: "" },
  { name: "Mariano McLean", number: "", position: "1B", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/McLean__Mariano_gaBPm.JPG?width=400&quality=90" },
  { name: "Martin Galo", number: "", position: "C", year: "Fr.", photo: "" },
  { name: "Mason Latimore", number: "", position: "C", year: "Fr.", photo: "" },
  { name: "Mason Sly", number: "", position: "LHP", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Sly__J7V7C.JPG?width=400&quality=90" },
  { name: "Max Williams", number: "", position: "2B", year: "Fr.", photo: "" },
  { name: "Moises Davison", number: "", position: "RHP", year: "Fr.", photo: "" },
  { name: "Myles Tucker", number: "", position: "OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Tucker__QCj3k.JPG?width=400&quality=90" },
  { name: "Noah Nelson", number: "", position: "3B", year: "Fr.", photo: "" },
  { name: "Oscar Eanes", number: "", position: "1B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Eanes__oC533.JPG?width=400&quality=90" },
  { name: "Parker Moore", number: "", position: "OF", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Moore__Parker_oggTs.JPG?width=400&quality=90" },
  { name: "Peyton Coakley", number: "", position: "1B", year: "Fr.", photo: "" },
  { name: "Preston Baham", number: "", position: "MIF", year: "Fr.", photo: "" },
  { name: "PrinceZion Odom", number: "", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Odom__PrinceZion_wsG8X.JPG?width=400&quality=90" },
  { name: "Princeton Hawks II", number: "", position: "RHP", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Hawks__Princeton_II_C4PAJ.JPG?width=400&quality=90" },
  { name: "Quenton Mitchell Jr", number: "", position: "3B", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Mitchell__Quinton_qYqNO.JPG?width=400&quality=90" },
  { name: "Raymond Jenkins", number: "", position: "OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Jenkins__Raymond_U4gg3.JPG?width=400&quality=90" },
  { name: "Reago Hutson", number: "", position: "RHP", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Hutson__Oqxks.JPG?width=400&quality=90" },
  { name: "Robert Robinson Jr", number: "", position: "1B", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Robinson__Roosevelt_Jr_ZOakn.JPG?width=400&quality=90" },
  { name: "Ryan Myers", number: "", position: "C", year: "Fr.", photo: "" },
  { name: "Ryan-Christopher Thompson", number: "", position: "1B", year: "Fr.", photo: "" },
  { name: "Satchel Hamilton", number: "", position: "C", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Hamilton__Satchell_Oi2oO.JPG?width=400&quality=90" },
  { name: "Toussaint Bythewood", number: "", position: "OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Bythewood__Toussaint_Rau1n.JPG?width=400&quality=90" },
  { name: "Tripp Braswell", number: "", position: "3B", year: "So.", photo: "https://morehouseathletics.com/images/2026/4/11/IMG_9093.JPG?width=400&quality=90" },
  { name: "Tyson Dawson", number: "", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Dawson__pEFEQ.JPG?width=400&quality=90" },
  { name: "Vernon Clay", number: "", position: "RHP", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Clay__Vernon_zlAST.JPG?width=400&quality=90" },
  { name: "Xavion Childs", number: "", position: "2B", year: "Fr.", photo: "" },
  { name: "Zach Thornton", number: "", position: "OF", year: "Fr.", photo: "" },
];
