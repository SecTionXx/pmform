export class jsPDF {
  constructor(options?: any) {}

  addImage(
    imageData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {}

  save(filename: string): void {}

  text(text: string, x: number, y: number): void {}

  setFont(fontName: string): void {}

  setFontSize(size: number): void {}

  addFont(
    postScriptName: string,
    fontName: string,
    fontStyle: string
  ): void {}

  addFileToVFS(fileName: string, base64String: string): void {}
}
