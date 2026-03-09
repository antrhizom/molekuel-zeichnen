declare module 'smiles-drawer' {
  interface DrawerOptions {
    width?: number;
    height?: number;
    bondThickness?: number;
    bondLength?: number;
    shortBondLength?: number;
    bondSpacing?: number;
    atomVisualization?: 'default' | 'balls' | 'none';
    fontSizeLarge?: number;
    fontSizeSmall?: number;
    padding?: number;
    terminalCarbons?: boolean;
    explicitHydrogens?: boolean;
  }

  interface ParseTree {}

  class Drawer {
    constructor(options?: DrawerOptions);
    draw(
      tree: ParseTree,
      target: string | HTMLCanvasElement,
      theme?: 'light' | 'dark',
      computeOnly?: boolean
    ): void;
  }

  class SvgDrawer {
    constructor(options?: DrawerOptions);
    draw(
      tree: ParseTree,
      target: string | SVGElement,
      theme?: 'light' | 'dark',
      computeOnly?: boolean
    ): void;
  }

  function parse(
    smiles: string,
    successCallback: (tree: ParseTree) => void,
    errorCallback?: (error: Error) => void
  ): void;
}
