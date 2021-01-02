const courses = ["CS 61A", "CS 61B", "CS 61C", "CS 70", "CS 160", "CS 161", "CS 162", "CS 164", "CS 169A", "CS 170", "CS 186", "CS 188", "CS 189"];
const clientBaseUrl = "localhost:8887";

const getFormPath = (formName, formCourse) => {
    formName = formName.toLowerCase();
    formCourse = formCourse.toLowerCase().split(" ")[1];
    return `${clientBaseUrl}/${formCourse}/${formName.replaceAll(" ", "-")}`;
}


export { courses, clientBaseUrl, getFormPath };