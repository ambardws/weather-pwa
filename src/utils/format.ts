import format from "date-fns/format";

export const formatDate = (inputDate: string) => {
  const date = new Date(inputDate);

  const formattedDate = format(date, "EEEE dd/MM/yyyy");
  return formattedDate;
};
