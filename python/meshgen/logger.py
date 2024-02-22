import logging

class Logger:
  formatter: logging.Formatter
  logger: logging.Logger
  log_file: str
  
  def __init__(self, log_level: int = logging.DEBUG,  log_file = None):
    self.logger = logging.getLogger(__name__)
    self.logger.setLevel(log_level)
    self.formatter = logging.Formatter('[%(asctime)s] %(levelname)s %(message)s')
    self.setup_console_handler()
    self.setup_file_handler(log_file)

  def setup_file_handler(self, log_file):
    if log_file is None:
      return
    self.log_file = log_file
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(self.formatter)
    self.logger.addHandler(file_handler)

  def setup_console_handler(self):
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(self.formatter)
    self.logger.addHandler(console_handler)

  def info(self, message):
    self.logger.info(message)

  def warning(self, message):
    self.logger.warning(message)

  def error(self, message):
    self.logger.error(message)

  def exception(self, message):
    self.logger.exception(message)

  def debug(self, message):
    self.logger.debug(message)
  
  def critical(self, message):
    self.logger.critical(message)
