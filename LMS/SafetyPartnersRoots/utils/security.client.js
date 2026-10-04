import  DOMPurify  from 'dompurify'

export function sanitizeHTML(input){
    return DOMPurify.sanitize(input)
}














