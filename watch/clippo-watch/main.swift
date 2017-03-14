import Cocoa

let pasteboard = NSPasteboard.general()

var changeCount = 0

while (true)
{
    if (changeCount != pasteboard.changeCount)
    {
        changeCount = pasteboard.changeCount
        let items = pasteboard.readObjects(forClasses: [NSString.self, NSImage.self], options: nil)
        for item in items!
        {
            var obj = [String: AnyObject]()
            
            obj["count"] = pasteboard.changeCount as AnyObject?
            
            if let string = item as? String
            {
                obj["text"] = string as AnyObject?
            }
            
            if let image = item as? NSImage
            {
                let data = NSBitmapImageRep(data: image.tiffRepresentation!)!.representation(using: .PNG, properties: [:])!
                obj["image"] = data.base64EncodedString(options: NSData.Base64EncodingOptions(rawValue: 0)) as AnyObject?
            }
            
            do
            {
                let jsonData = try JSONSerialization.data(withJSONObject: obj, options: JSONSerialization.WritingOptions.prettyPrinted)
                let jsonStrg = String(data: jsonData, encoding: String.Encoding.utf8)
                try jsonStrg!.write(toFile: "pb.json", atomically: true, encoding: String.Encoding.utf8)
            }
            catch
            {
                print(error)
            }
        }
    }
    usleep(500000) // sleep for half a second
}
