const html2canvas = jest.fn().mockImplementation((element: HTMLElement, options?: any) => {
  return Promise.resolve({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockImageData'),
    width: 800,
    height: 600,
  });
});

export default html2canvas;
