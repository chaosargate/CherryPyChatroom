def read_file(filename):
    file_txt = ""

    try:
        with open("../bin/{filename}".format(filename=filename)) as file_str:
            file_txt = file_str.read()
    except:
        pass

    return file_txt.strip()
