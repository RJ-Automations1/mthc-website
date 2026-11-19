/**
 * Players preloaded into the fundraiser — the 2026 Morehouse Baseball roster from
 * https://morehouseathletics.com/sports/baseball/roster/2026 (pulled 2026-11-19).
 * Each name gets its own invite page on startup. To add a player, add them here (or on the admin page).
 * To drop one, remove them here AND delete them on the admin page (otherwise the next restart re-adds them).
 */
export interface RosterPlayer {
  name: string;
  number: string;
  position: string;
  year: string;
  photo: string; // headshot on morehouseathletics.com, '' when none
}

export const FUNDRAISER_ROSTER: RosterPlayer[] = [
  { name: "Raymond Jenkins", number: "1", position: "OF", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Jenkins__Raymond_U4gg3.JPG?width=400&quality=90" },
  { name: "Vernon Clay", number: "2", position: "MIF/RHP", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Clay__Vernon_zlAST.JPG?width=400&quality=90" },
  { name: "Elijah James", number: "3", position: "OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/James__Elijah_xu1j0.JPG?width=400&quality=90" },
  { name: "Caleb Harley", number: "4", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/4/11/IMG_9088.JPG?width=400&quality=90" },
  { name: "Kendal Sellers", number: "5", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Sellers__Kendall_3QYRq.JPG?width=400&quality=90" },
  { name: "Elijah Pinckney", number: "6", position: "SS", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Pinckney__Elijah_9zj4w.JPG?width=400&quality=90" },
  { name: "Tripp Braswell", number: "7", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/4/11/IMG_9093.JPG?width=400&quality=90" },
  { name: "James Thorpe", number: "8", position: "OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Thorpe__Jame_2SnSm.JPG?width=400&quality=90" },
  { name: "Mason Sly", number: "9", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Sly__J7V7C.JPG?width=400&quality=90" },
  { name: "Cam Simmons", number: "10", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Simmons__Cam_Z7tFq.JPG?width=400&quality=90" },
  { name: "Cameron Solomon", number: "11", position: "RHP/OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/4/11/IMG_9100.JPG?width=400&quality=90" },
  { name: "Kendyn Fredieu", number: "12", position: "OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Fredieu__Kendyn_bRcpL.JPG?width=400&quality=90" },
  { name: "Julian Goodman", number: "13", position: "RHP/MIF", year: "So.", photo: "" },
  { name: "Princeton Hawks II", number: "14", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Hawks__Princeton_II_C4PAJ.JPG?width=400&quality=90" },
  { name: "Josiah Smith", number: "15", position: "C/1B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Smith__Josiah_uGlDC.JPG?width=400&quality=90" },
  { name: "Ian Makle", number: "16", position: "LHP", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Makle__Ian_qnVpx.JPG?width=400&quality=90" },
  { name: "Satchel Hamilton", number: "17", position: "C/1B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Hamilton__Satchell_Oi2oO.JPG?width=400&quality=90" },
  { name: "Noah Grayson", number: "18", position: "RHP", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/4/11/IMG_9083.JPG?width=400&quality=90" },
  { name: "Reago Hutson", number: "19", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Hutson__Oqxks.JPG?width=400&quality=90" },
  { name: "Myles Tucker", number: "20", position: "1B/OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Tucker__QCj3k.JPG?width=400&quality=90" },
  { name: "Andwele Pittman", number: "21", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Pittman__Andwele_OJovn.JPG?width=400&quality=90" },
  { name: "Quenton Mitchell Jr", number: "22", position: "RHP/1B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Mitchell__Quinton_qYqNO.JPG?width=400&quality=90" },
  { name: "Mariano McLean", number: "23", position: "MIF/1B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/McLean__Mariano_gaBPm.JPG?width=400&quality=90" },
  { name: "TJ Whiteman", number: "24", position: "2B/3B", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/27/IMG_8845.JPG?width=400&quality=90" },
  { name: "Joseph Richburg", number: "25", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Richburg__Joseph_q5z8b.JPG?width=400&quality=90" },
  { name: "Jackson Edington", number: "26", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Edington__Jackson_RKVVw.JPG?width=400&quality=90" },
  { name: "Nicholas Pittman", number: "27", position: "OF", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Pittman__Nicholas_rNn2O.JPG?width=400&quality=90" },
  { name: "Holden Lane", number: "31", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Lane__Holden_cAPLR.JPG?width=400&quality=90" },
  { name: "Robert Robinson Jr", number: "32", position: "C/1B", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Robinson__Roosevelt_Jr_ZOakn.JPG?width=400&quality=90" },
  { name: "Alec Waller", number: "33", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Waller__Alec_Vwk6n.JPG?width=400&quality=90" },
  { name: "Antoine Holloway", number: "34", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/4/11/IMG_9097.JPG?width=400&quality=90" },
  { name: "Chase Williams", number: "35", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Williams__fiq5s.JPG?width=400&quality=90" },
  { name: "Denver Matthews", number: "36", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Matthews__Denver_7GauW.JPG?width=400&quality=90" },
  { name: "Jordan Bibbs-Walker", number: "38", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Bibbs__-Walker__Jordan_6tWp5.JPG?width=400&quality=90" },
  { name: "Bradley Selma", number: "41", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Selma__Bradley_1ruwM.JPG?width=400&quality=90" },
  { name: "Myles Gordon", number: "42", position: "OF", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Gordon__YrVPY.JPG?width=400&quality=90" },
  { name: "James Wyllie", number: "43", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Wyllie__QD9nM.JPG?width=400&quality=90" },
  { name: "Zachary Kelly", number: "44", position: "RHP/1B", year: "Jr.", photo: "https://morehouseathletics.com/images/2026/1/26/Kelly__Zach_9Thvx.JPG?width=400&quality=90" },
  { name: "Walter Nunnally", number: "47", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Nunnally__Walter_bROJD.JPG?width=400&quality=90" },
  { name: "Drew Rhoden", number: "49/60", position: "SS/2B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Rhoden__Drew_UWib3.JPG?width=400&quality=90" },
  { name: "PrinceZion Odom", number: "51", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Odom__PrinceZion_wsG8X.JPG?width=400&quality=90" },
  { name: "Dejorryn Pettis", number: "53/39", position: "RHP/2B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Pettis__Dejorryn_54gAH.JPG?width=400&quality=90" },
  { name: "Calvin Butts", number: "55", position: "OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Butts__Cam_oR2tG.JPG?width=400&quality=90" },
  { name: "Jalen Allen", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Allen__yeaui.JPG?width=400&quality=90" },
  { name: "Cornell Boyd III", number: "", position: "3B/MIF", year: "So.", photo: "" },
  { name: "Jalen Brogdon", number: "", position: "", year: "Fr.", photo: "" },
  { name: "Toussaint Bythewood", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Bythewood__Toussaint_Rau1n.JPG?width=400&quality=90" },
  { name: "Noah Daes", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Deas__Noah_pFyMs.JPG?width=400&quality=90" },
  { name: "Don-Trae Davis", number: "", position: "OF/1B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Davis__Don-Trae_jj6rK.JPG?width=400&quality=90" },
  { name: "Tyson Dawson", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Dawson__pEFEQ.JPG?width=400&quality=90" },
  { name: "Oscar Eanes", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Eanes__oC533.JPG?width=400&quality=90" },
  { name: "Jacob Haynes", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Haynes__LtEdg.JPG?width=400&quality=90" },
  { name: "Clayton Kayira", number: "", position: "OF/3B", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Kayira__Clayton_gzviL.JPG?width=400&quality=90" },
  { name: "Edwin Lewis II", number: "", position: "", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/1/26/Lewis__Edwin_II_9upXt.JPG?width=400&quality=90" },
  { name: "Trey Maull", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Maul__Trey_wx2FB.JPG?width=400&quality=90" },
  { name: "John McCovey", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/McCovey__John_BwGSN.JPG?width=400&quality=90" },
  { name: "Keith Minor", number: "", position: "RHP", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Minor__TGQLu.JPG?width=400&quality=90" },
  { name: "Triston Minor", number: "", position: "MIF/OF", year: "So.", photo: "" },
  { name: "Parker Moore", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Moore__Parker_oggTs.JPG?width=400&quality=90" },
  { name: "Chi Smith", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Smith__Chi_06j57.JPG?width=400&quality=90" },
  { name: "Hunter Smith", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Smith__Hunter_kT0XF.JPG?width=400&quality=90" },
  { name: "Roman Stamps", number: "", position: "RHP/OF", year: "So.", photo: "https://morehouseathletics.com/images/2026/1/26/Stamps__HTlMI.JPG?width=400&quality=90" },
  { name: "William Walker", number: "", position: "OF", year: "So.", photo: "" },
  { name: "Kareem Weaver", number: "", position: "OF/RHP", year: "Sr.", photo: "https://morehouseathletics.com/images/2026/4/11/Weaver__Kareem.jpg?width=400&quality=90" },
  { name: "Gabriel Westry", number: "", position: "", year: "Fr.", photo: "https://morehouseathletics.com/images/2026/1/26/Westry__Gabriel_2NLBS.JPG?width=400&quality=90" },
];
