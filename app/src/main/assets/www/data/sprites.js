// Hojas de sprites dibujadas, una por peleador.
// En data/peleadores.js el peleador dice sprite:'nombre' y acá se registra SPRITES.nombre.
//
// Dos formas de registrar una hoja:
//  1) Con la plantilla (recomendado): SPRITES.nombre={src:'assets/sprites/nombre.png',plantilla:true};
//     La hoja tiene que seguir assets/sprites/plantilla-48.png (ver LEEME.md).
//  2) Con cuadros a mano, como la de Alejandro Zanella: cada movimiento es una lista de
//     cuadros [x, y, ancho, alto, centroDeLaCabeza] dentro del PNG.
// Los movimientos que falten usan la guardia.
const SPRITES={};

SPRITES.zanella={
 src:'assets/sprites/alejandro-zanella.png',
 frames:{
  "guard": [
   [
    182,
    1,
    23,
    40,
    11
   ],
   [
    206,
    1,
    21,
    40,
    10
   ]
  ],
  "walk": [
   [
    0,
    3,
    20,
    38,
    11
   ],
   [
    21,
    3,
    16,
    38,
    9
   ],
   [
    38,
    3,
    18,
    38,
    10
   ],
   [
    57,
    3,
    23,
    38,
    12
   ],
   [
    81,
    3,
    14,
    38,
    8
   ],
   [
    96,
    3,
    22,
    38,
    12
   ]
  ],
  "pwind": [
   [
    378,
    4,
    18,
    37,
    13
   ]
  ],
  "jab": [
   [
    228,
    1,
    31,
    40,
    12
   ]
  ],
  "cross": [
   [
    260,
    1,
    31,
    40,
    12
   ]
  ],
  "hook": [
   [
    397,
    3,
    21,
    38,
    14
   ]
  ],
  "upper": [
   [
    397,
    3,
    21,
    38,
    14
   ]
  ],
  "kwind": [
   [
    419,
    1,
    18,
    40,
    7
   ]
  ],
  "low": [
   [
    292,
    0,
    32,
    41,
    7
   ]
  ],
  "high": [
   [
    325,
    0,
    33,
    41,
    8
   ]
  ],
  "block": [
   [
    359,
    3,
    18,
    38,
    13
   ]
  ],
  "crouch": [
   [
    182,
    1,
    23,
    40,
    11
   ]
  ],
  "hurt": [
   [
    119,
    3,
    19,
    38,
    7
   ]
  ],
  "shoot": [
   [
    57,
    3,
    23,
    38,
    12
   ]
  ],
  "win": [
   [
    159,
    0,
    22,
    41,
    14
   ],
   [
    139,
    2,
    19,
    39,
    11
   ]
  ]
 }
};
// El cross derecho usa el mismo cuadro que el izquierdo (esta hoja no tiene uno propio)
SPRITES.zanella.frames.hookR=SPRITES.zanella.frames.hook;

/* ---------- Plantilla de hojas ----------
   Celdas de 48x48, el peleador mirando a la derecha, los pies tocando el borde de abajo de la celda
   y la cabeza centrada. Una fila por movimiento, en este orden: */
const PLANTILLA={celda:48,filas:[
 ['guard',4],   // 1  guardia (quieto)
 ['walk',6],    // 2  caminar
 ['jab',3],     // 3  jab              (preparación, golpe, vuelta)
 ['cross',3],   // 4  recto
 ['hook',3],    // 5  cross izquierdo
 ['hookR',3],   // 6  cross derecho
 ['upper',3],   // 7  uppercut
 ['low',3],     // 8  low kick
 ['high',4],    // 9  high kick
 ['shoot',3],   // 10 derribo
 ['block',2],   // 11 cubrirse (cuadro 1) y agacharse (cuadro 2)
 ['hurt',2],    // 12 recibir golpe
 ['ko',3],      // 13 caído / KO
 ['win',2]      // 14 festejo
]};
function framesDePlantilla(){
 const c=PLANTILLA.celda,F={};
 PLANTILLA.filas.forEach(([k,n],row)=>{F[k]=Array.from({length:n},(_,i)=>[i*c,row*c,c,c,c/2]);});
 F.crouch=[F.block[1]];F.block=[F.block[0]];
 return F;
}

// Para sumar un peleador con hoja nueva, agregá una línea así (y en peleadores.js ponele sprite:'nombre'):
// SPRITES.nombre={src:'assets/sprites/nombre.png',plantilla:true};
