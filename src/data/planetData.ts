export interface Planet {
  name: string;
  type: string;
  distanceFromSun: string;
  diameter: string;
  orbitalPeriod: string;
  rotationPeriod: string;
  moons: string;
  mass: string;
  temperature: string;
  description: string;
}

export const planetData: Record<string, Planet> = {
  sun: {
    name: 'Sol',
    type: 'Estrela (Anã Amarela - Tipo G)',
    distanceFromSun: '0 km',
    diameter: '1.392.700 km',
    orbitalPeriod: 'N/A',
    rotationPeriod: '~27 dias (no equador)',
    moons: 'N/A',
    mass: '1.989 × 10³⁰ kg (99,86% do Sistema Solar)',
    temperature: 'Superfície: 5.505°C | Núcleo: 15.000.000°C',
    description: 'O Sol é a estrela central do Sistema Solar, uma esfera de plasma quente composta principalmente de hidrogênio (73%) e hélio (25%). No seu núcleo, 600 milhões de toneladas de hidrogênio são convertidos em hélio a cada segundo através de fusão nuclear, gerando a energia que sustenta toda a vida na Terra.',
  },
  mercury: {
    name: 'Mercúrio',
    type: 'Planeta Terrestre',
    distanceFromSun: '57.909.050 km (0,387 UA)',
    diameter: '4.879,4 km',
    orbitalPeriod: '87,97 dias terrestres',
    rotationPeriod: '58,65 dias terrestres',
    moons: '0',
    mass: '3,285 × 10²³ kg (0,055 Terras)',
    temperature: '-173°C (noite) a 427°C (dia)',
    description: 'Mercúrio é o menor e mais próximo planeta do Sol. Possui a maior variação de temperatura de superfície do Sistema Solar. Sua órbita é altamente elíptica e tem a maior excentricidade de todos os planetas. O núcleo de ferro representa cerca de 85% do raio planetário.',
  },
  venus: {
    name: 'Vênus',
    type: 'Planeta Terrestre',
    distanceFromSun: '108.208.000 km (0,723 UA)',
    diameter: '12.103,6 km',
    orbitalPeriod: '224,7 dias terrestres',
    rotationPeriod: '243 dias terrestres (retrógrada)',
    moons: '0',
    mass: '4,867 × 10²⁴ kg (0,815 Terras)',
    temperature: '462°C (média na superfície)',
    description: 'Vênus é o planeta mais quente do Sistema Solar devido ao seu intenso efeito estufa. Sua atmosfera densa é composta por 96,5% de CO₂. Curiosamente, Vênus gira no sentido oposto aos outros planetas (rotação retrógrada) e um dia venusiano é mais longo que seu ano.',
  },
  earth: {
    name: 'Terra',
    type: 'Planeta Terrestre',
    distanceFromSun: '149.598.023 km (1 UA)',
    diameter: '12.742 km',
    orbitalPeriod: '365,256 dias',
    rotationPeriod: '23h 56min 4s',
    moons: '1 (Lua)',
    mass: '5,972 × 10²⁴ kg',
    temperature: '-88°C a 58°C (média: 15°C)',
    description: 'A Terra é o único planeta conhecido por abrigar vida. Formada há 4,54 bilhões de anos, possui água líquida em 71% de sua superfície. Sua atmosfera (78% N₂, 21% O₂) protege a vida da radiação solar. O campo magnético gerado por seu núcleo de ferro-níquel desvia o vento solar.',
  },
  mars: {
    name: 'Marte',
    type: 'Planeta Terrestre',
    distanceFromSun: '227.939.200 km (1,524 UA)',
    diameter: '6.779 km',
    orbitalPeriod: '686,98 dias terrestres (1,88 anos)',
    rotationPeriod: '24h 37min',
    moons: '2 (Fobos e Deimos)',
    mass: '6,39 × 10²³ kg (0,107 Terras)',
    temperature: '-143°C a 35°C (média: -63°C)',
    description: 'Marte, o "Planeta Vermelho", tem sua cor característica devido ao óxido de ferro (ferrugem) em sua superfície. Possui o Monte Olimpo, o maior vulcão do Sistema Solar com 21 km de altura. Evidências indicam que água líquida fluiu em sua superfície há bilhões de anos.',
  },
  jupiter: {
    name: 'Júpiter',
    type: 'Gigante Gasoso',
    distanceFromSun: '778.340.821 km (5,203 UA)',
    diameter: '139.820 km',
    orbitalPeriod: '11,86 anos terrestres',
    rotationPeriod: '9h 55min',
    moons: '95 confirmadas (incluindo Io, Europa, Ganimedes, Calisto)',
    mass: '1,898 × 10²⁷ kg (317,8 Terras)',
    temperature: '-108°C (topo das nuvens)',
    description: 'Júpiter é o maior planeta do Sistema Solar, com massa 2,5 vezes maior que todos os outros planetas combinados. Sua Grande Mancha Vermelha é uma tempestade anticiclônica ativa há pelo menos 400 anos. Júpiter atua como um "escudo cósmico", atraindo asteroides e cometas com sua imensa gravidade.',
  },
  saturn: {
    name: 'Saturno',
    type: 'Gigante Gasoso',
    distanceFromSun: '1.426.666.422 km (9,537 UA)',
    diameter: '116.460 km',
    orbitalPeriod: '29,46 anos terrestres',
    rotationPeriod: '10h 33min',
    moons: '146 confirmadas (incluindo Titã, Encélado)',
    mass: '5,683 × 10²⁶ kg (95,2 Terras)',
    temperature: '-139°C (média)',
    description: 'Saturno é famoso por seus espetaculares anéis, compostos principalmente de bilhões de partículas de gelo e rocha, variando de grãos microscópicos a pedras do tamanho de uma casa. É o planeta menos denso do Sistema Solar - sua densidade é menor que a da água. Titã, sua maior lua, possui atmosfera densa e lagos de metano.',
  },
  uranus: {
    name: 'Urano',
    type: 'Gigante de Gelo',
    distanceFromSun: '2.870.658.186 km (19,19 UA)',
    diameter: '50.724 km',
    orbitalPeriod: '84,01 anos terrestres',
    rotationPeriod: '17h 14min (retrógrada)',
    moons: '27 conhecidas',
    mass: '8,681 × 10²⁵ kg (14,5 Terras)',
    temperature: '-224°C (mínima registrada)',
    description: 'Urano tem uma característica única: seu eixo de rotação está inclinado 98°, fazendo com que o planeta essencialmente role de lado em sua órbita. É o planeta mais frio do Sistema Solar, apesar de não ser o mais distante. Sua cor azul-esverdeada vem do metano na atmosfera superior.',
  },
  neptune: {
    name: 'Netuno',
    type: 'Gigante de Gelo',
    distanceFromSun: '4.498.396.441 km (30,07 UA)',
    diameter: '49.244 km',
    orbitalPeriod: '164,79 anos terrestres',
    rotationPeriod: '16h 6min',
    moons: '14 conhecidas (incluindo Tritão)',
    mass: '1,024 × 10²⁶ kg (17,1 Terras)',
    temperature: '-214°C (média)',
    description: 'Netuno é o planeta mais distante do Sol e possui os ventos mais fortes do Sistema Solar, atingindo velocidades supersônicas de até 2.100 km/h. Sua cor azul vibrante resulta do metano atmosférico. Netuno irradia 2,6 vezes mais energia do que recebe do Sol, indicando uma fonte de calor interna.',
  },
};
