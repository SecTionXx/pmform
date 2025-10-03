export const google = {
  auth: {
    GoogleAuth: jest.fn().mockImplementation(() => ({
      getClient: jest.fn().mockResolvedValue({}),
    })),
  },
  sheets: jest.fn().mockReturnValue({
    spreadsheets: {
      values: {
        append: jest.fn().mockResolvedValue({
          data: {
            updates: {
              updatedRows: 1,
            },
          },
        }),
        get: jest.fn().mockResolvedValue({
          data: {
            values: [
              ['Header1', 'Header2'],
              ['Value1', 'Value2'],
            ],
          },
        }),
      },
    },
  }),
};
