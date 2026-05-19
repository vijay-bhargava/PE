import DOMPurify from 'dompurify';


export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const sanitizeInput=(input)=> {
  
  return DOMPurify.sanitize(input);
}