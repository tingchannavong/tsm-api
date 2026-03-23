export default function notFound(re, res) {
    res.status(404);
    res.json({message: "'Error 404: have no service in this path'"});
}