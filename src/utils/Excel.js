const { leadService } = require("../services");
const path = require("path");
const ExcelJS = require("exceljs");
const { sendEmail } = require("../utils/sendEmail");
const { users } = require("../models");
const generateExcelSheet = async () => {
  const leads = await leadService.getAllLeads1();
  console.log(leads.length);
  //const todayLeads = await leadService.getTodayLeads();
  const workbook = new ExcelJS.Workbook();
  workbook.calcProperties.fullCalcOnLoad = false;

  const worksheet = workbook.addWorksheet("Today Leads");
  worksheet.columns = [
    { header: "UID", key: "UID", width: 10 },
    { header: "Name", key: "Name", width: 10 },
    { header: "City", key: "City", width: 10 },
    { header: "Address", key: "Address", width: 10 },
    { header: "CreatedBy", key: "CreatedBy", width: 10 },
    { header: "Phone1", key: "Phone1", width: 10 },
    { header: "Phone2", key: "Phone2", width: 10 },
    { header: "Email", key: "Email", width: 10 },
    { header: "AssignTo", key: "AssignTo", width: 10 },
    { header: "Source", key: "Source", width: 10 },
    { header: "Course", key: "Course", width: 10 },
    { header: "CoursePrice", key: "CoursePrice", width: 10 },
    { header: "Status", key: "Status", width: 10 },
    { header: "FollowupDate", key: "FollowupDate", width: 10 },
    { header: "Branch", key: "Branch", width: 10 },
    { header: "Remark", key: "Remark", width: 40 },
    { header: "prevFollowupDate", key: "prevFollowupDate", width: 10 },
    { header: "prevStatusDate", key: "prevStatusDate", width: 10 },
    { header: "prevStatus", key: "prevStatus", width: 10 },
    { header: "prevCourse", key: "prevCourse", width: 10 },
    { header: "prevPrice", key: "prevPrice", width: 10 },
    { header: "EnquiryDate", key: "EnquiryDate", width: 10 },
    { header: "LogType", key: "LogType", width: 10 },
    { header: "Remarks", key: "Remarks", width: 10 },
  ];

  const batchSize = 500; 
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize);
    batch.forEach((item) => {
      worksheet.addRow(item);
    });
  }


  // for (let item of leads) {
  //   worksheet.addRow(item);
  // }

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  let filePath = path.join(__dirname, "../../uploads/leadDate.xlsx");
  await workbook.xlsx.writeFile(filePath);

  try {
    console.log("Excel file generated successfully.");
    // const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
    // if (!token) {
    //   return 
    // }

    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await users.findById(decoded.userId).lean();

    // if (!user) {
    //   return
    // }

    // if (user.UserType !== 2 ) {
    //   return 
    // }

    // await sendEmail({
    //   email: user.Email,
    //   subject: `Excel Sheet`,
    // });


  } catch (error) {
    console.log("An error occurred:", error);
  }
   

  await sendEmail({
    email: "aditya@matrixinfotechsolution.com",
    subject: `Excel Sheet`,
  });


  // await sendEmail({
  //   email: "Girindra.karn@thexlacademy.com",
  //   subject: `Excel Sheet`,
  // });

  // await sendEmail({
  //   email: "info.thexlacademy@gmail.com",
  //   subject: `Excel Sheet`,
  // });
};
module.exports = {
  generateExcelSheet,
};
